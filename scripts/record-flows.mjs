import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const portfolioRoot = path.resolve(__dirname, '..');
const reposRoot = path.resolve(portfolioRoot, '..');
const videoOutputDir = path.join(portfolioRoot, 'public', 'videos');
const tempVideoDir = path.join(portfolioRoot, '.temp_recordings');

// Ensure output directories exist
if (!fs.existsSync(videoOutputDir)) fs.mkdirSync(videoOutputDir, { recursive: true });
if (!fs.existsSync(tempVideoDir)) fs.mkdirSync(tempVideoDir, { recursive: true });

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.ico': 'image/x-icon'
};

function createStaticServer(baseDir, customRouter = null) {
  return http.createServer((req, res) => {
    const parsedUrl = req.url.split('?')[0];

    if (customRouter && customRouter(parsedUrl, req, res)) {
      return;
    }

    let reqPath = parsedUrl === '/' ? '/index.html' : parsedUrl;
    let filePath = path.join(baseDir, reqPath);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      const fallback = path.join(baseDir, 'index.html');
      if (fs.existsSync(fallback)) {
        filePath = fallback;
      } else {
        res.writeHead(404);
        return res.end('Not found');
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

async function finalizeVideo(page, context, targetName) {
  const video = page.video();
  await page.close();
  await context.close();
  if (video) {
    const targetFile = path.join(videoOutputDir, `${targetName}.webm`);
    await video.saveAs(targetFile);
    console.log(`[Video] Successfully exported ${targetFile} (${fs.statSync(targetFile).size} bytes)`);
  }
}

const FLOWS = {
  // 1. OmniLens (LensClone-Frontend)
  async omnilens(browser) {
    console.log('\n--- Recording OmniLens User Flow ---');
    const distDir = path.join(reposRoot, 'LensClone-Frontend', 'dist', 'lens-clone', 'browser');
    const server = createStaticServer(distDir);
    await new Promise((res) => server.listen(0, '127.0.0.1', res));
    const port = server.address().port;

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      recordVideo: { dir: tempVideoDir, size: { width: 1280, height: 800 } }
    });
    const page = await context.newPage();

    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Flow: Step through navigation tabs
    const tabs = page.locator('.nav-tab');
    if ((await tabs.count()) >= 4) {
      // 1. Shopping Budget
      await tabs.nth(1).click();
      await page.waitForTimeout(1200);

      // 2. Diagnostics
      await tabs.nth(2).click();
      await page.waitForTimeout(1400);

      // 3. Preferences
      await tabs.nth(3).click();
      await page.waitForTimeout(1000);

      // 4. Back to Analytics & Heatmap
      await tabs.nth(0).click();
      await page.waitForTimeout(1000);
    }

    // Toggle GPS accuracy
    const gpsBtn = page.locator('.location-badge-btn');
    if (await gpsBtn.isVisible()) {
      await gpsBtn.click();
      await page.waitForTimeout(800);
      const allowBtn = page.locator('button:has-text("Allow Selected"), button.btn-primary').first();
      if (await allowBtn.isVisible()) {
        await allowBtn.click();
        await page.waitForTimeout(600);
      }
    }

    // Switch to Mobile Feed viewfinder simulation
    const simBtn = page.locator('.sim-btn');
    if (await simBtn.isVisible()) {
      await simBtn.click();
      await page.waitForTimeout(2000);
    }

    server.close();
    await finalizeVideo(page, context, 'omnilens');
  },

  // 2. CurriculaHub (OrganizadorCursada)
  async curriculahub(browser) {
    console.log('\n--- Recording CurriculaHub User Flow ---');
    const distDir = path.join(reposRoot, 'OrganizadorCursada', 'dist', 'OrganizadorCursada', 'browser');
    const server = createStaticServer(distDir);
    await new Promise((res) => server.listen(0, '127.0.0.1', res));
    const port = server.address().port;

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: tempVideoDir, size: { width: 1440, height: 900 } }
    });
    const page = await context.newPage();

    await page.goto(`http://127.0.0.1:${port}/home`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Flow: Click "Cargar Demo"
    const demoBtn = page.getByRole('button', { name: /Cargar Demo/i });
    if (await demoBtn.isVisible()) {
      await demoBtn.click();
      await page.waitForTimeout(1500);
    }

    // Click first few course cards to toggle status & advance progress
    const courseCards = page.locator('.course-card, mat-card');
    if ((await courseCards.count()) > 0) {
      await courseCards.first().click();
      await page.waitForTimeout(800);
      if ((await courseCards.count()) > 1) {
        await courseCards.nth(1).click();
        await page.waitForTimeout(800);
      }
    }

    // Navigate to "Mi semana"
    const weekLink = page.locator('a[href*="myWeek"], button:has-text("Mi semana")').first();
    if (await weekLink.isVisible()) {
      await weekLink.click();
      await page.waitForTimeout(1500);
    }

    // Navigate to "Plan Hub"
    const workshopLink = page.locator('a[href*="workshop"], button:has-text("Plan Hub")').first();
    if (await workshopLink.isVisible()) {
      await workshopLink.click();
      await page.waitForTimeout(1500);
    }

    server.close();
    await finalizeVideo(page, context, 'curriculahub');
  },

  // 3. Cartas Políticas (CartasPoliticas-Frontend)
  async 'cartas-politicas'(browser) {
    console.log('\n--- Recording Cartas Políticas User Flow ---');
    const distDir = path.join(reposRoot, 'CartasPoliticas-Frontend', 'dist', 'cp-ssr');
    const server = createStaticServer(distDir);
    await new Promise((res) => server.listen(0, '127.0.0.1', res));
    const port = server.address().port;

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      recordVideo: { dir: tempVideoDir, size: { width: 1280, height: 800 } }
    });
    const page = await context.newPage();

    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);

    // Flow: Interact with main menu
    const createBtn = page.locator('.btn-cp-primary, a:has-text("Crear Nueva Partida")').first();
    if (await createBtn.isVisible()) {
      await createBtn.hover();
      await page.waitForTimeout(800);
      await createBtn.click();
      await page.waitForTimeout(1500);
    }

    // Scroll through game setup modal/screen
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(1500);

    server.close();
    await finalizeVideo(page, context, 'cartas');
  },

  // 4. SmartPantry (carrefour-reposicion-extension)
  async 'smart-pantry'(browser) {
    console.log('\n--- Recording SmartPantry User Flow ---');
    const extDir = path.join(reposRoot, 'carrefour-reposicion-extension', 'extension');
    const server = createStaticServer(extDir);
    await new Promise((res) => server.listen(0, '127.0.0.1', res));
    const port = server.address().port;

    const context = await browser.newContext({
      viewport: { width: 620, height: 750 },
      recordVideo: { dir: tempVideoDir, size: { width: 620, height: 750 } }
    });
    const page = await context.newPage();

    await page.addInitScript(() => {
      const now = new Date();
      const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();
      const mockStorage = {
        orderList: [
          { orderId: '101', creationDate: daysAgo(60) },
          { orderId: '102', creationDate: daysAgo(45) },
          { orderId: '103', creationDate: daysAgo(30) },
          { orderId: '104', creationDate: daysAgo(15) },
          { orderId: '105', creationDate: daysAgo(2) }
        ],
        order_101: {
          date: daysAgo(60),
          items: [
            { name: 'Leche Entera Clásica 1L', brand: 'La Serenísima', skuId: '1', quantity: 2, categoriesIds: ['/1/'] },
            { name: 'Café Molido Tostado 250g', brand: 'La Virginia', skuId: '2', quantity: 1, categoriesIds: ['/2/'] },
            { name: 'Aceite de Girasol 1.5L', brand: 'Natura', skuId: '3', quantity: 1, categoriesIds: ['/3/'] }
          ]
        },
        order_102: {
          date: daysAgo(45),
          items: [
            { name: 'Leche Entera Clásica 1L', brand: 'La Serenísima', skuId: '1', quantity: 2, categoriesIds: ['/1/'] },
            { name: 'Yerba Mate Suave 1kg', brand: 'Playadito', skuId: '4', quantity: 1, categoriesIds: ['/4/'] }
          ]
        },
        order_103: {
          date: daysAgo(30),
          items: [
            { name: 'Leche Entera Clásica 1L', brand: 'La Serenísima', skuId: '1', quantity: 2, categoriesIds: ['/1/'] },
            { name: 'Café Molido Tostado 250g', brand: 'La Virginia', skuId: '2', quantity: 1, categoriesIds: ['/2/'] },
            { name: 'Detergente Lavavajillas 750ml', brand: 'Magistral', skuId: '5', quantity: 1, categoriesIds: ['/5/'] }
          ]
        },
        order_104: {
          date: daysAgo(15),
          items: [
            { name: 'Leche Entera Clásica 1L', brand: 'La Serenísima', skuId: '1', quantity: 2, categoriesIds: ['/1/'] },
            { name: 'Yerba Mate Suave 1kg', brand: 'Playadito', skuId: '4', quantity: 1, categoriesIds: ['/4/'] }
          ]
        },
        order_105: {
          date: daysAgo(2),
          items: [
            { name: 'Leche Entera Clásica 1L', brand: 'La Serenísima', skuId: '1', quantity: 2, categoriesIds: ['/1/'] },
            { name: 'Arroz Largo Fino 1kg', brand: 'Gallo', skuId: '6', quantity: 1, categoriesIds: ['/6/'] }
          ]
        }
      };

      window.chrome = {
        storage: {
          local: {
            get: (keys, cb) => {
              if (typeof keys === 'string') {
                const res = { [keys]: mockStorage[keys] };
                if (cb) cb(res);
                return Promise.resolve(res);
              }
              if (cb) cb(mockStorage);
              return Promise.resolve(mockStorage);
            },
            set: (obj, cb) => { if (cb) cb(); return Promise.resolve(); }
          }
        },
        runtime: {
          lastError: null,
          sendMessage: (msg, cb) => {
            if (msg.type === 'GET_CART') {
              if (cb) cb({ success: true, items: [] });
            } else if (msg.type === 'GET_CATEGORIES') {
              if (cb) cb({ success: true, categories: {} });
            }
          },
          onMessage: { addListener: () => {} }
        }
      };
    });

    await page.goto(`http://127.0.0.1:${port}/popup.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Flow 1: Search filter
    const searchInput = page.locator('#searchInput');
    await searchInput.fill('leche');
    await page.waitForTimeout(1200);
    await searchInput.fill('');
    await page.waitForTimeout(800);

    // Flow 2: Switch group mode
    const groupSelect = page.locator('#groupMode');
    await groupSelect.selectOption('vtex_category');
    await page.waitForTimeout(1200);
    await groupSelect.selectOption('generic');
    await page.waitForTimeout(1000);

    // Flow 3: Click Add to Cart on first overdue item
    const addCartBtn = page.locator('.btn-add-cart').first();
    if (await addCartBtn.isVisible()) {
      await addCartBtn.click();
      await page.waitForTimeout(1500);
    }

    server.close();
    await finalizeVideo(page, context, 'smartpantry');
  },

  // 5. AC License Center (ac-license-center)
  async 'ac-license-center'(browser) {
    console.log('\n--- Recording AC License Center User Flow ---');
    const repoRoot = path.join(reposRoot, 'ac-license-center');
    const staticDir = path.join(repoRoot, 'tools', 'web_ui', 'static');
    const gtJsonPath = path.join(repoRoot, 'docs', 'Gran_Turismo_License_Tests.json');
    const curriculumPath = path.join(repoRoot, 'data', 'curriculum.json');

    const router = (parsedUrl, req, res) => {
      if (parsedUrl === '/api/reference_tests' || parsedUrl === '/api/reference-tests') {
        const rawGt = fs.existsSync(gtJsonPath) ? fs.readFileSync(gtJsonPath, 'utf8') : '[]';
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, tests: JSON.parse(rawGt) }));
        return true;
      }
      if (parsedUrl === '/api/curriculum') {
        const rawCurr = fs.existsSync(curriculumPath) ? fs.readFileSync(curriculumPath, 'utf8') : '[]';
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, curriculum: JSON.parse(rawCurr) }));
        return true;
      }
      return false;
    };

    const server = createStaticServer(staticDir, router);
    await new Promise((res) => server.listen(0, '127.0.0.1', res));
    const port = server.address().port;

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: tempVideoDir, size: { width: 1440, height: 900 } }
    });
    const page = await context.newPage();

    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Dismiss tour modal completely
    await page.evaluate(() => {
      const m = document.getElementById('modal-tour-welcome');
      if (m) m.remove();
    });
    await page.waitForTimeout(500);

    // Flow: Select a test card
    const testItems = page.locator('.test-item, .card, [data-test-id]');
    if ((await testItems.count()) > 1) {
      await testItems.nth(1).click();
      await page.waitForTimeout(1200);
    }

    // Toggle track canvas / editor view
    const canvas = page.locator('#track-canvas');
    if (await canvas.isVisible()) {
      const box = await canvas.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2 + 50);
        await page.mouse.up();
        await page.waitForTimeout(1500);
      }
    }

    server.close();
    await finalizeVideo(page, context, 'ac-license-center');
  },

  // 6. ts2mermaid (tsTypes2umlBack)
  async ts2mermaid(browser) {
    console.log('\n--- Recording ts2mermaid User Flow ---');
    const context = await browser.newContext({
      viewport: { width: 1200, height: 750 },
      recordVideo: { dir: tempVideoDir, size: { width: 1200, height: 750 } }
    });
    const page = await context.newPage();

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: #0d1117;
          color: #c9d1d9;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 30px;
        }
        .window {
          width: 100%;
          max-width: 1100px;
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 12px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          overflow: hidden;
        }
        .title-bar {
          background: #0d1117;
          border-bottom: 1px solid #30363d;
          padding: 12px 18px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .dot { width: 12px; height: 12px; border-radius: 50%; }
        .red { background: #ff5f56; }
        .yellow { background: #ffbd2e; }
        .green { background: #27c93f; }
        .title { margin-left: 12px; font-size: 13px; color: #8b949e; font-weight: 600; }
        .badge-tag {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          margin-left: auto;
          background: #238636;
          color: #ffffff;
        }
        .content { padding: 24px 28px; font-size: 14px; line-height: 1.6; }
        .prompt { color: #58a6ff; font-weight: bold; }
        .cmd { color: #f0f6fc; }
        .step { opacity: 0; transition: opacity 0.5s ease-in-out; }
        .step.visible { opacity: 1; }
        .step-scan { color: #8b949e; margin-top: 12px; }
        .step-parsed { color: #3fb950; }
        .step-ast { color: #79c0ff; }
        .step-success { color: #3fb950; font-weight: bold; margin-top: 8px; }
        .code-box {
          margin-top: 16px;
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 8px;
          padding: 18px 22px;
          font-size: 13px;
        }
        .keyword { color: #ff7b72; font-weight: bold; }
        .cls { color: #ffa657; font-weight: bold; }
        .prop { color: #d2a8ff; }
        .type { color: #79c0ff; }
        .comment { color: #8b949e; font-style: italic; }
      </style>
    </head>
    <body>
      <div class="window">
        <div class="title-bar">
          <div class="dot red"></div>
          <div class="dot yellow"></div>
          <div class="dot green"></div>
          <div class="title">ts2mermaid — TypeScript AST to Mermaid UML CLI</div>
          <span class="badge-tag">CLI + REST Engine</span>
        </div>
        <div class="content">
          <div><span class="prompt">user@dev:~/tsTypes2umlBack$</span> <span class="cmd" id="cmdSpan"></span></div>
          <div class="step step-scan" id="s1">🔍 Traversing TypeScript AST across ./src/tsCompiler...</div>
          <div class="step step-parsed" id="s2">✓ Discovered 16 source files (42 interfaces, 14 classes, 9 type aliases)</div>
          <div class="step step-ast" id="s3">⚙ Resolving heritage clauses, member visibility tokens, and type arguments...</div>
          <div class="step step-success" id="s4">✨ Mermaid UML diagram successfully generated in 84ms:</div>
          
          <div class="code-box step" id="s5">
            <div class="comment">%% Master Architecture Overview Diagram (Generated by ts2mermaid v1.0.0)</div>
            <div><span class="keyword">classDiagram</span></div>
            <div>&nbsp;&nbsp;<span class="keyword">class</span> <span class="cls">AstTraverser</span> {</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="prop">+sourceFiles:</span> <span class="type">ts.SourceFile[]</span></div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="prop">+traverse():</span> <span class="type">IAstReport</span></div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="prop">#extractHeritage(node):</span> <span class="type">HeritageClause[]</span></div>
            <div>&nbsp;&nbsp;}</div>
            <div>&nbsp;&nbsp;<span class="keyword">class</span> <span class="cls">ClusterBuilder</span> {</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="prop">+buildModularClusters(report):</span> <span class="type">ClusterMap</span></div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="prop">+serializeToMermaid(format):</span> <span class="type">string</span></div>
            <div>&nbsp;&nbsp;}</div>
            <div>&nbsp;&nbsp;<span class="cls">AstTraverser</span> <span class="keyword">--&gt;</span> <span class="cls">ClusterBuilder</span> : feeds parsed tokens</div>
            <div>&nbsp;&nbsp;<span class="cls">ClusterBuilder</span> <span class="keyword">..|&gt;</span> <span class="cls">IMermaidSerializer</span> : implements</div>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;

    await page.setContent(htmlContent);
    await page.waitForTimeout(500);

    // Animate typing the command
    const cmdText = 'npx ts2mermaid ./src/tsCompiler -d class --direction TD -f mermaid';
    for (let i = 1; i <= cmdText.length; i++) {
      await page.evaluate((text) => {
        document.getElementById('cmdSpan').innerText = text;
      }, cmdText.slice(0, i));
      await page.waitForTimeout(25);
    }

    // Step revelations with pacing
    await page.waitForTimeout(400);
    await page.evaluate(() => document.getElementById('s1').classList.add('visible'));
    await page.waitForTimeout(600);
    await page.evaluate(() => document.getElementById('s2').classList.add('visible'));
    await page.waitForTimeout(600);
    await page.evaluate(() => document.getElementById('s3').classList.add('visible'));
    await page.waitForTimeout(600);
    await page.evaluate(() => document.getElementById('s4').classList.add('visible'));
    await page.waitForTimeout(700);
    await page.evaluate(() => document.getElementById('s5').classList.add('visible'));
    await page.waitForTimeout(2000);

    await finalizeVideo(page, context, 'ts2mermaid');
  },

  // 7. BellView Intercom (bellview)
  async 'bellview-intercom'(browser) {
    console.log('\n--- Recording BellView Intercom User Flow ---');
    const context = await browser.newContext({
      viewport: { width: 520, height: 720 },
      recordVideo: { dir: tempVideoDir, size: { width: 520, height: 720 } }
    });
    const page = await context.newPage();

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: #101012;
          color: #ffffff;
          font-family: 'Segoe UI Variable Display', 'Segoe UI', system-ui, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
        }
        .window-card {
          width: 480px;
          background: #1C1C1E;
          border: 1.5px solid #38383A;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.6);
        }
        .header { display: flex; justify-content: space-between; margin-bottom: 16px; }
        .caller-title { font-size: 18px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
        .subtitle { font-size: 12px; color: #98989D; margin-top: 4px; }
        .close-btn { width: 28px; height: 28px; background: #2C2C2E; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #98989D; font-size: 12px; }
        .video-box {
          height: 250px;
          background: linear-gradient(135deg, #141E30 0%, #243B55 100%);
          border-radius: 10px;
          border: 1px solid #2A2A2E;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .video-overlay-top {
          position: absolute; top: 12px; left: 12px; right: 12px;
          display: flex; justify-content: space-between;
          font-family: Consolas, monospace; font-size: 10px;
        }
        .hud-pill { background: rgba(0,0,0,0.6); padding: 4px 8px; border-radius: 4px; display: flex; align-items: center; gap: 6px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: #4CAF50; }
        .avatar-ring {
          width: 80px; height: 80px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.4); background: rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center; font-size: 40px; margin-bottom: 8px;
        }
        .status-banner {
          margin: 12px 0; padding: 10px 14px; background: #2C2C2E; border: 1px solid #38383A;
          border-radius: 8px; font-size: 12px; font-weight: 600; text-align: center; color: #81C784;
          transition: all 0.3s ease;
        }
        .status-banner.unlocked {
          background: #0E6B37; color: #FFFFFF; border-color: #4CAF50;
        }
        .unlock-btn {
          width: 100%; height: 50px; background: #107C41; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);
          color: white; font-size: 15px; font-weight: bold; display: flex; align-items: center; justify-content: center;
          gap: 10px; cursor: pointer; margin-bottom: 10px; transition: transform 0.1s ease, background 0.2s ease;
        }
        .unlock-btn:active, .unlock-btn.active {
          transform: scale(0.98); background: #0B532B;
        }
        .call-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
        .ans-btn { height: 46px; background: #0078D4; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600; font-size: 13px; }
        .dec-btn { height: 46px; background: #D13438; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600; font-size: 13px; }
        .disclaimer { padding: 8px; background: rgba(255,152,0,0.1); border: 1px solid rgba(255,152,0,0.3); border-radius: 6px; text-align: center; font-size: 11px; font-weight: 600; color: #FFB74D; }
        .wave-bar { width: 3px; background: #81C784; border-radius: 1.5px; animation: bounce 0.8s infinite ease-in-out; }
        @keyframes bounce { 0%, 100% { height: 4px; } 50% { height: 18px; } }
      </style>
    </head>
    <body>
      <div class="window-card">
        <div class="header">
          <div>
            <div class="caller-title">🔔 100 - Front Gate (Intercom)</div>
            <div class="subtitle">Incoming video call — Early-media streaming</div>
          </div>
          <div class="close-btn">✕</div>
        </div>
        <div class="video-box">
          <div class="video-overlay-top">
            <div class="hud-pill"><div class="dot"></div> LIVE 1080p · H.264 RTP Early-Media</div>
            <div class="hud-pill">SIP: 100@gate.local</div>
          </div>
          <div class="avatar-ring">👤</div>
          <div style="font-size: 13px; font-weight: 600;">Front Gate Doorbell Station</div>
          <div style="font-size: 11px; color: #90CAF9;">Bidirectional Audio/Video Active</div>
        </div>
        <div class="status-banner" id="statusBanner">⚡ Door station ringing — Press Space to Unlock or Enter to Answer</div>
        <div class="unlock-btn" id="unlockBtn">
          🔑 UNLOCK DOOR <span style="background: rgba(255,255,255,0.25); font-size: 11px; padding: 3px 6px; border-radius: 4px;">Space / U</span>
        </div>
        <div class="call-actions">
          <div class="ans-btn">📞 Answer Call [Enter]</div>
          <div class="dec-btn">✕ Decline [Esc]</div>
        </div>
        <div class="disclaimer">BellView Intercom · Microsoft Store Edition · Native Windows 11 Desktop Client</div>
      </div>
    </body>
    </html>
    `;

    await page.setContent(htmlContent);
    await page.waitForTimeout(1500);

    // Simulate clicking unlock door
    const unlockBtn = page.locator('#unlockBtn');
    await unlockBtn.hover();
    await page.waitForTimeout(800);
    await page.evaluate(() => {
      document.getElementById('unlockBtn').classList.add('active');
      const b = document.getElementById('statusBanner');
      b.classList.add('unlocked');
      b.innerHTML = '✓ Door Strike Relay Triggered — UNLOCKED (5.0s pulse)';
    });
    await page.waitForTimeout(2000);

    await finalizeVideo(page, context, 'bellview');
  }
};

async function main() {
  const target = process.argv[2];
  const browser = await chromium.launch({ channel: 'chrome' });

  console.log('=== Automated E2E User-Flow Video Recording ===');
  try {
    if (target && FLOWS[target]) {
      await FLOWS[target](browser);
    } else {
      for (const [name, fn] of Object.entries(FLOWS)) {
        await fn(browser);
      }
    }
    console.log('\n=== All user flows recorded and exported successfully! ===');
  } catch (err) {
    console.error('Error during flow recording:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
