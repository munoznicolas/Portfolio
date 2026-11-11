import { test, expect } from '@playwright/test';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { getAppUrl } from '../src/config/deployments.config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const portfolioRoot = path.resolve(__dirname, '..');
const reposRoot = path.resolve(portfolioRoot, '..');

const mimeTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm'
};

function createStaticServer(baseDir: string, customRouter?: (url: string, req: http.IncomingMessage, res: http.ServerResponse) => boolean) {
  return http.createServer((req, res) => {
    const parsedUrl = req.url?.split('?')[0] || '/';
    if (customRouter && customRouter(parsedUrl, req, res)) return;

    let reqPath = parsedUrl === '/' ? '/index.html' : parsedUrl;
    let filePath = path.join(baseDir, reqPath);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      const fallback = path.join(baseDir, 'index.html');
      if (fs.existsSync(fallback)) filePath = fallback;
      else {
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

/**
 * Resolves target URL: either the live production deployment URL or a local ephemeral test server.
 */
async function resolveTarget(appId: string, distDir: string, customRouter?: (url: string, req: http.IncomingMessage, res: http.ServerResponse) => boolean) {
  if (process.env.USE_LIVE_DEPLOYMENTS === 'true') {
    const liveUrl = getAppUrl(appId);
    if (liveUrl) {
      return { url: liveUrl, close: () => {} };
    }
  }

  expect(fs.existsSync(distDir), `Local distribution directory should exist at ${distDir}`).toBeTruthy();
  const server = createStaticServer(distDir, customRouter);
  await new Promise<void>((res) => server.listen(0, '127.0.0.1', () => res()));
  const port = (server.address() as any).port;
  return {
    url: `http://127.0.0.1:${port}`,
    close: () => server.close()
  };
}

test.describe('External Application Live Health & E2E Flow Suite', () => {

  test('OmniLens (LensClone-Frontend): Desktop Workspace & Tabs Switch', async ({ page }) => {
    const distDir = path.join(reposRoot, 'LensClone-Frontend', 'dist', 'lens-clone', 'browser');
    const target = await resolveTarget('omnilens', distDir);

    try {
      await page.goto(target.url, { waitUntil: 'networkidle' });
      await expect(page.locator('.brand h1')).toContainText('Google Lens');

      const tabs = page.locator('.nav-tab');
      expect(await tabs.count()).toBeGreaterThanOrEqual(4);

      // Verify Tab 2 (Shopping Budget)
      await tabs.nth(1).click();
      await expect(tabs.nth(1)).toHaveClass(/active/);

      // Verify Tab 3 (Diagnostics)
      await tabs.nth(2).click();
      await expect(tabs.nth(2)).toHaveClass(/active/);

      // Verify GPS modal
      const gpsBtn = page.locator('.location-badge-btn');
      await expect(gpsBtn).toBeVisible();
      await gpsBtn.click();
      const allowBtn = page.locator('button:has-text("Allow Selected"), button.btn-primary').first();
      await expect(allowBtn).toBeVisible();
      await allowBtn.click();
    } finally {
      target.close();
    }
  });

  test('CurriculaHub (OrganizadorCursada): Degree Demo Loading & Progress State', async ({ page }) => {
    const distDir = path.join(reposRoot, 'OrganizadorCursada', 'dist', 'OrganizadorCursada', 'browser');
    const target = await resolveTarget('curriculahub', distDir);

    try {
      const url = target.url.includes('/home') ? target.url : `${target.url.replace(/\/$/, '')}/home`;
      await page.goto(url, { waitUntil: 'networkidle' });

      // Click "Cargar Demo"
      const demoBtn = page.getByRole('button', { name: /Cargar Demo/i });
      await expect(demoBtn).toBeVisible();
      await demoBtn.click();

      // Ensure courses and progress are initialized
      const progressText = page.locator('.progress-text');
      await expect(progressText).toBeVisible();
      await expect(progressText).toContainText('Avance:');

      // Navigate to Mi semana
      const weekLink = page.locator('a[href*="myWeek"], button:has-text("Mi semana")').first();
      await weekLink.click();
      await expect(page).toHaveURL(/myWeek/);
    } finally {
      target.close();
    }
  });

  test('Cartas Políticas (CartasPoliticas-Frontend): Main Menu & Match Creation', async ({ page }) => {
    const distDir = path.join(reposRoot, 'CartasPoliticas-Frontend', 'dist', 'cp-ssr');
    const target = await resolveTarget('cartas-politicas', distDir);

    try {
      await page.goto(target.url, { waitUntil: 'networkidle' });
      await expect(page.locator('body')).toContainText('Cartas Políticas');

      const createLink = page.locator('.btn-cp-primary, a:has-text("Crear Nueva Partida")').first();
      await expect(createLink).toBeVisible();
      await createLink.click();
    } finally {
      target.close();
    }
  });

  test('SmartPantry (carrefour-reposicion-extension): Popup Table & Replenishment Heuristic', async ({ page }) => {
    const extDir = path.join(reposRoot, 'carrefour-reposicion-extension', 'extension');
    const target = await resolveTarget('smart-pantry', extDir);

    try {
      await page.addInitScript(() => {
        const now = new Date();
        const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();
        const mockStorage = {
          orderList: [
            { orderId: '101', creationDate: daysAgo(30) },
            { orderId: '102', creationDate: daysAgo(15) },
            { orderId: '103', creationDate: daysAgo(2) }
          ],
          order_101: {
            date: daysAgo(30),
            items: [{ name: 'Leche Entera 1L', brand: 'La Serenísima', skuId: '1', quantity: 2, categoriesIds: ['/1/'] }]
          },
          order_102: {
            date: daysAgo(15),
            items: [{ name: 'Leche Entera 1L', brand: 'La Serenísima', skuId: '1', quantity: 2, categoriesIds: ['/1/'] }]
          },
          order_103: {
            date: daysAgo(2),
            items: [{ name: 'Leche Entera 1L', brand: 'La Serenísima', skuId: '1', quantity: 2, categoriesIds: ['/1/'] }]
          }
        };

        (window as any).chrome = {
          storage: {
            local: {
              get: (keys: any, cb: any) => {
                if (typeof keys === 'string') {
                  const res = { [keys]: (mockStorage as any)[keys] };
                  if (cb) cb(res);
                  return Promise.resolve(res);
                }
                if (cb) cb(mockStorage);
                return Promise.resolve(mockStorage);
              },
              set: (obj: any, cb: any) => { if (cb) cb(); return Promise.resolve(); }
            }
          },
          runtime: {
            lastError: null,
            sendMessage: (msg: any, cb: any) => {
              if (msg.type === 'GET_CART') cb?.({ success: true, items: [] });
              if (msg.type === 'GET_CATEGORIES') cb?.({ success: true, categories: {} });
            },
            onMessage: { addListener: () => {} }
          }
        };
      });

      const url = target.url.includes('popup.html') ? target.url : `${target.url.replace(/\/$/, '')}/popup.html`;
      await page.goto(url, { waitUntil: 'networkidle' });

      // Verify table render
      const rows = page.locator('#resultsBody tr');
      await expect(rows).toHaveCount(1);
      await expect(page.locator('#summary')).toContainText('pedido(s) considerados');
    } finally {
      target.close();
    }
  });

  test('AC License Center (ac-license-center): Web Designer & Track Spline Engine', async ({ page }) => {
    const repoRoot = path.join(reposRoot, 'ac-license-center');
    const staticDir = path.join(repoRoot, 'tools', 'web_ui', 'static');
    const gtJsonPath = path.join(repoRoot, 'docs', 'Gran_Turismo_License_Tests.json');
    const curriculumPath = path.join(repoRoot, 'data', 'curriculum.json');

    const router = (parsedUrl: string, req: http.IncomingMessage, res: http.ServerResponse) => {
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

    const target = await resolveTarget('ac-license-center', staticDir, router);

    try {
      await page.goto(target.url, { waitUntil: 'networkidle' });
      await page.evaluate(() => {
        const m = document.getElementById('modal-tour-welcome');
        if (m) m.remove();
      });

      const trackCanvas = page.locator('#track-canvas');
      await expect(trackCanvas).toBeVisible();
    } finally {
      target.close();
    }
  });

  test('ts2mermaid (tsTypes2umlBack): CLI AST Compiler Output', async () => {
    const repoRoot = path.join(reposRoot, 'tsTypes2umlBack');
    expect(fs.existsSync(repoRoot), 'tsTypes2umlBack repo must exist').toBeTruthy();

    const output = execSync('npx ts-node src/cmdIndex.ts src/mermaidSerializers -d class -s', {
      cwd: repoRoot,
      encoding: 'utf8'
    });

    expect(output).toContain('classDiagram');
    expect(output).toContain('Cluster_MermaidSerializers');
  });

});
