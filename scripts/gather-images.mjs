import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const portfolioRoot = path.resolve(__dirname, '..');
const reposRoot = path.resolve(portfolioRoot, '..');
const outputDir = path.join(portfolioRoot, 'public', 'images');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Resilient Playwright import
let playwright;
try {
  playwright = require('playwright');
} catch {
  try {
    playwright = require(path.join(reposRoot, 'OrganizadorCursada', 'node_modules', 'playwright'));
  } catch (err) {
    console.error('Playwright could not be loaded. Please run: npm install -D playwright');
    process.exit(1);
  }
}
const { chromium } = playwright;

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

const GATHERERS = {
  // 1. OmniLens (LensClone-Frontend)
  async omnilens(browser) {
    console.log('[OmniLens] Gathering preview image...');
    const distDir = path.join(reposRoot, 'LensClone-Frontend', 'dist', 'lens-clone', 'browser');
    if (!fs.existsSync(distDir)) {
      console.log('[OmniLens] Building frontend distribution...');
      execSync('npm run build', { cwd: path.join(reposRoot, 'LensClone-Frontend'), stdio: 'inherit' });
    }

    const server = createStaticServer(distDir);
    await new Promise((res) => server.listen(0, '127.0.0.1', res));
    const port = server.address().port;

    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const outPath = path.join(outputDir, 'omnilens-preview.png');
    await page.screenshot({ path: outPath });
    await page.close();
    server.close();
    console.log(`[OmniLens] Saved to ${outPath}`);
  },

  // 2. Cartas Políticas (CartasPoliticas-Frontend)
  async 'cartas-politicas'(browser) {
    console.log('[Cartas Políticas] Gathering preview image...');
    const distDir = path.join(reposRoot, 'CartasPoliticas-Frontend', 'dist', 'cp-ssr');
    if (!fs.existsSync(distDir)) {
      console.log('[Cartas Políticas] Building distribution...');
      execSync('npm run build', { cwd: path.join(reposRoot, 'CartasPoliticas-Frontend'), stdio: 'inherit' });
    }

    const server = createStaticServer(distDir);
    await new Promise((res) => server.listen(0, '127.0.0.1', res));
    const port = server.address().port;

    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const outPath = path.join(outputDir, 'cartas-preview.png');
    await page.screenshot({ path: outPath });
    await page.close();
    server.close();
    console.log(`[Cartas Políticas] Saved to ${outPath}`);
  },

  // 3. CurriculaHub (OrganizadorCursada)
  async curriculahub(browser) {
    console.log('[CurriculaHub] Gathering preview image...');
    const distDir = path.join(reposRoot, 'OrganizadorCursada', 'dist', 'OrganizadorCursada', 'browser');
    if (!fs.existsSync(distDir)) {
      console.log('[CurriculaHub] Building distribution...');
      execSync('npm run build', { cwd: path.join(reposRoot, 'OrganizadorCursada'), stdio: 'inherit' });
    }

    const server = createStaticServer(distDir);
    await new Promise((res) => server.listen(0, '127.0.0.1', res));
    const port = server.address().port;

    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`http://127.0.0.1:${port}/home`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const demoBtn = await page.getByRole('button', { name: /Cargar Demo/i });
    if (await demoBtn.isVisible()) {
      await demoBtn.click();
      await page.waitForTimeout(1500);
    }

    const outPath = path.join(outputDir, 'curriculahub-preview.png');
    await page.screenshot({ path: outPath });
    fs.copyFileSync(outPath, path.join(outputDir, 'curricula-preview.png'));
    await page.close();
    server.close();
    console.log(`[CurriculaHub] Saved to ${outPath}`);
  },

  // 4. SmartPantry (carrefour-reposicion-extension)
  async 'smart-pantry'(browser) {
    console.log('[SmartPantry] Gathering preview image...');
    const extDir = path.join(reposRoot, 'carrefour-reposicion-extension', 'extension');
    const server = createStaticServer(extDir);
    await new Promise((res) => server.listen(0, '127.0.0.1', res));
    const port = server.address().port;

    const page = await browser.newPage({ viewport: { width: 620, height: 750 } });

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

    const outPath = path.join(outputDir, 'smartpantry-preview.png');
    await page.screenshot({ path: outPath });
    await page.close();
    server.close();
    console.log(`[SmartPantry] Saved to ${outPath}`);
  },

  // 5. AC License Center (ac-license-center)
  async 'ac-license-center'(browser) {
    console.log('[AC License Center] Gathering preview image...');
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

    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const outPath = path.join(outputDir, 'ac-license-center-preview.png');
    await page.screenshot({ path: outPath });
    await page.close();
    server.close();
    console.log(`[AC License Center] Saved to ${outPath}`);
  },

  // 6. BellView Intercom (bellview)
  async 'bellview-intercom'() {
    console.log('[BellView Intercom] Gathering preview image via PowerShell XAML RenderTargetBitmap...');
    const outPath = path.join(outputDir, 'bellview-preview.png');
    const ps1Script = path.join(__dirname, 'render-bellview.ps1');
    execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${ps1Script}" -OutputPath "${outPath}"`, { stdio: 'inherit' });
    console.log(`[BellView Intercom] Saved to ${outPath}`);
  },

  // 7. ts2mermaid (tsTypes2umlBack)
  async ts2mermaid(browser) {
    console.log('[ts2mermaid] Gathering preview image...');
    const page = await browser.newPage({ viewport: { width: 1200, height: 750 } });

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
          padding: 40px;
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
          <div><span class="prompt">user@dev:~/tsTypes2umlBack$</span> <span class="cmd">npx ts2mermaid ./src/tsCompiler -d class --direction TD -f mermaid</span></div>
          <div class="step-scan">🔍 Traversing TypeScript AST across ./src/tsCompiler...</div>
          <div class="step-parsed">✓ Discovered 16 source files (42 interfaces, 14 classes, 9 type aliases)</div>
          <div class="step-ast">⚙ Resolving heritage clauses, member visibility tokens, and type arguments...</div>
          <div class="step-success">✨ Mermaid UML diagram successfully generated in 84ms:</div>
          
          <div class="code-box">
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

    const outPath = path.join(outputDir, 'ts2mermaid-preview.png');
    await page.screenshot({ path: outPath });
    await page.close();
    console.log(`[ts2mermaid] Saved to ${outPath}`);
  }
};

async function main() {
  const targetProject = process.argv[2];
  const browser = await chromium.launch({ channel: 'chrome' });

  console.log('=== Automated Showcase Image Gathering ===');
  try {
    if (targetProject && GATHERERS[targetProject]) {
      await GATHERERS[targetProject](browser);
    } else {
      for (const [name, fn] of Object.entries(GATHERERS)) {
        await fn(browser);
      }
    }
    console.log('=== All showcase images gathered successfully! ===');
  } catch (err) {
    console.error('Error during image gathering:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
