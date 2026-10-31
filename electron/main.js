const { app, BrowserWindow, ipcMain, safeStorage, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');

const SETTINGS_FILE = () => path.join(app.getPath('userData'), 'settings.json');

async function readSettings() {
  try {
    const data = JSON.parse(await fs.readFile(SETTINGS_FILE(), 'utf8'));
    const out = {};
    for (const [id, item] of Object.entries(data.providers || {})) {
      let apiKey = item.apiKey || '';
      if (item.encrypted && safeStorage.isEncryptionAvailable()) {
        try { apiKey = safeStorage.decryptString(Buffer.from(apiKey, 'base64')); } catch { apiKey = ''; }
      }
      out[id] = { ...item, apiKey };
    }
    return out;
  } catch { return {}; }
}

async function writeSettings(providers) {
  const old = await readSettings();
  const merged = { ...old };
  for (const [id, incoming] of Object.entries(providers || {})) {
    const prior = old[id] || {};
    const apiKey = incoming.apiKey || prior.apiKey || '';
    let persisted = apiKey;
    let encrypted = false;
    if (apiKey && safeStorage.isEncryptionAvailable()) {
      persisted = safeStorage.encryptString(apiKey).toString('base64');
      encrypted = true;
    }
    merged[id] = { model: incoming.model || prior.model || '', baseUrl: incoming.baseUrl || prior.baseUrl || '', apiKey: persisted, encrypted };
  }
  await fs.mkdir(path.dirname(SETTINGS_FILE()), { recursive: true });
  await fs.writeFile(SETTINGS_FILE(), JSON.stringify({ providers: merged }, null, 2), { mode: 0o600 });
  return publicSettings(merged);
}

function publicSettings(settings, decrypted = false) {
  const safe = {};
  for (const [id, item] of Object.entries(settings || {})) {
    safe[id] = { configured: Boolean(item.apiKey), model: item.model || '', baseUrl: item.baseUrl || '' };
    if (decrypted) safe[id].apiKey = item.apiKey || '';
  }
  return safe;
}

function extractText(data, id) {
  if (id === 'gemini') return data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('\n') || '';
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.map(x => x.text || '').join('\n');
  return '';
}

async function callModel({ providerId, prompt, system }) {
  const all = await readSettings();
  const cfg = all[providerId];
  if (!cfg?.apiKey) throw new Error('Bu sağlayıcı için API anahtarı girilmemiş. Sağ üstteki API ayarlarını açın.');
  const model = cfg.model || (providerId === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini');
  let url, headers, body;
  if (providerId === 'gemini') {
    url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(cfg.apiKey)}`;
    headers = { 'Content-Type': 'application/json' };
    body = { systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, responseMimeType: 'application/json' } };
  } else {
    const base = (providerId === 'openai' ? 'https://api.openai.com/v1' : providerId === 'openrouter' ? 'https://openrouter.ai/api/v1' : providerId === 'deepseek' ? 'https://api.deepseek.com/v1' : cfg.baseUrl || 'https://api.groq.com/openai/v1').replace(/\/+$/, '');
    url = `${base}/chat/completions`;
    headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.apiKey}` };
    if (providerId === 'openrouter') { headers['HTTP-Referer'] = 'https://egehsmedya.com'; headers['X-Title'] = 'EgeHS AI Vitrin'; }
    body = { model, temperature: 0.7, messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }] };
  }
  const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), signal: AbortSignal.timeout(90000) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || data?.message || `API isteği başarısız (${response.status}). Model adını, anahtarı ve sağlayıcı ayarlarını kontrol edin.`);
  const text = extractText(data, providerId);
  if (!text) throw new Error('Yapay zekâ boş yanıt döndürdü. Başka bir model deneyin.');
  return text;
}

function createWindow() {
  const win = new BrowserWindow({ width: 1450, height: 940, minWidth: 1100, minHeight: 720, backgroundColor: '#080d18', title: 'EgeHS AI Vitrin', icon: path.join(__dirname, '..', 'assets', 'icon.ico'), webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
  win.loadFile(path.join(__dirname, '..', 'index.html'));
}

ipcMain.handle('settings:get', async () => publicSettings(await readSettings()));
ipcMain.handle('settings:save', async (_event, providers) => writeSettings(providers));
ipcMain.handle('ai:generate', async (_event, payload) => callModel(payload));
ipcMain.handle('file:save-html', async (_event, html) => {
  const result = await dialog.showSaveDialog({ title: 'Dijital vitrini kaydet', defaultPath: 'egehs-dijital-vitrin.html', filters: [{ name: 'Web sayfası', extensions: ['html'] }] });
  if (result.canceled || !result.filePath) return { canceled: true };
  await fs.writeFile(result.filePath, html, 'utf8');
  return { canceled: false, filePath: result.filePath };
});
app.whenReady().then(() => { createWindow(); app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); }); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
