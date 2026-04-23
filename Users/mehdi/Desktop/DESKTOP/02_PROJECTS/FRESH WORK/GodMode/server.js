/**
 * GODMODE - Total System Control
 * http://localhost:9999
 */

const express = require('express');
const si      = require('systeminformation');
const { exec, spawn } = require('child_process');
const path = require('path');
const fs   = require('fs');
const os   = require('os');
const dns  = require('dns').promises;
const tls  = require('tls');
const http = require('http');
const https = require('https');
const net  = require('net');

const app  = express();
const PORT = 9999;

app.use(express.json());
app.use(express.static(__dirname));

// ── Config ────────────────────────────────────────────────────────────────────

const BASE = 'C:/Users/mehdi/Desktop/02_PROJECTS';

const PROJECTS = [
  { id: 'ouroz',    name: 'OUROZ',              path: `${BASE}/active/OUROZ`,                color: '#a855f7', devPort: 5173 },
  { id: 'bureau',   name: 'bureau-d-ordre',     path: `${BASE}/active/bureau-d-ordre`,       color: '#22d3ee', devPort: 5174 },
  { id: 'creators', name: 'creators.os',        path: `${BASE}/active/creators.os`,          color: '#22c55e', devPort: 5175 },
  { id: 'dalc',     name: 'DALC_OFFICIAL',      path: `${BASE}/active/DALC_OFFICIAL`,        color: '#f59e0b', devPort: 5176 },
  { id: 'novodent', name: 'novodent-smile',     path: `${BASE}/active/novodent-smile-portal`, color: '#ec4899', devPort: 5177 },
  { id: 'ilan',     name: 'ilan-crm',           path: `${BASE}/ilan-crm`,                    color: '#f97316', devPort: 5178 },
  { id: 'ctx',      name: 'contextmesh',        path: `${BASE}/contextmesh`,                 color: '#06b6d4', devPort: 5179 },
  { id: 's2c',      name: 'screenshot-to-code', path: 'C:/Users/mehdi/screenshot-to-code',   color: '#84cc16', devPort: 5180 },
];

const SCRIPTS = [
  { id: 'kill_heavy',     name: 'KILL BLOAT',       file: 'C:/Users/mehdi/Desktop/SYSTEM_SCRIPTS/kill_heavy.ps1',   color: '#ef4444', icon: '💀' },
  { id: 'clean_boost',    name: 'CLEAN BOOST',      file: 'C:/Users/mehdi/Desktop/SYSTEM_SCRIPTS/clean_boost.ps1',  color: '#f59e0b', icon: '⚡' },
  { id: 'shutdown_pro',   name: 'SHUTDOWN',         file: 'C:/Users/mehdi/Desktop/SYSTEM_SCRIPTS/shutdown_pro.ps1', color: '#8b5cf6', icon: '⏻'  },
  { id: 'end',            name: 'END DAY',          file: 'C:/Users/mehdi/Desktop/SYSTEM_SCRIPTS/END.ps1',          color: '#22d3ee', icon: '🌙' },
  { id: 'wipe_node_mods', name: 'WIPE NODE_MODULES',file: 'C:/Users/mehdi/wipe_node_modules2.ps1',                  color: '#f97316', icon: '🗑️' },
  { id: 'clean_dupes',    name: 'CLEAN DUPES',      file: 'C:/Users/mehdi/cleanup_safe_dupes.ps1',                  color: '#a78bfa', icon: '🧹' },
];

const runningDevs = {}; // { id: { pid } }

// ── Stats cache (updated in background) ───────────────────────────────────────

let statsCache = { cpu: 0, ram: { used: 0, total: 1, pct: 0 }, disk: null, uptime: 0, host: os.hostname() };
let procsCache = [];

const HIST_SIZE = 60;
const cpuHist = Array(HIST_SIZE).fill(0);
const ramHist = Array(HIST_SIZE).fill(0);

async function refreshStats() {
  try {
    const [load, mem, disks] = await Promise.all([si.currentLoad(), si.mem(), si.fsSize()]);
    const disk = disks.find(d => /^C:/i.test(d.mount) || d.mount === '/') || disks[0];
    statsCache = {
      cpu:    Math.round(load.currentLoad),
      ram:    { used: mem.used, total: mem.total, pct: Math.round(mem.used / mem.total * 100) },
      disk:   disk ? { used: disk.used, size: disk.size, pct: Math.round(disk.use) } : null,
      uptime: os.uptime(),
      host:   os.hostname(),
    };
  } catch {
    const total = os.totalmem(), used = total - os.freemem();
    statsCache.ram  = { used, total, pct: Math.round(used / total * 100) };
    statsCache.uptime = os.uptime();
  }
  cpuHist.push(statsCache.cpu); if (cpuHist.length > HIST_SIZE) cpuHist.shift();
  ramHist.push(statsCache.ram.pct); if (ramHist.length > HIST_SIZE) ramHist.shift();
}

async function refreshProcs() {
  try {
    const data = await si.processes();
    procsCache = data.list
      .filter(p => p.cpu > 0.05 || p.mem > 0.1)
      .sort((a, b) => (b.cpu + b.mem * 0.4) - (a.cpu + a.mem * 0.4))
      .slice(0, 35)
      .map(p => ({ pid: p.pid, name: p.name, cpu: +(p.cpu.toFixed(1)), mem: +(p.mem.toFixed(1)) }));
  } catch {}
}

// Warmup + background polling
refreshStats();
refreshProcs();
setInterval(refreshStats, 2000);
setInterval(refreshProcs, 6000);

// ── API ───────────────────────────────────────────────────────────────────────

app.get('/api/system',    (req, res) => res.json(statsCache));
app.get('/api/processes', (req, res) => res.json(procsCache));
app.get('/api/meta',      (req, res) => res.json({ projects: PROJECTS, scripts: SCRIPTS }));

app.post('/api/process/kill', (req, res) => {
  const { pid } = req.body;
  if (!pid) return res.status(400).json({ error: 'pid required' });
  exec(`taskkill /F /PID ${pid}`, { windowsHide: true }, (err, _, stderr) => {
    if (err) return res.status(500).json({ error: stderr || err.message });
    res.json({ ok: true });
  });
});

// ── Projects ──────────────────────────────────────────────────────────────────

const winPath = p => p.path.replace(/\//g, '\\');

function findProject(id) {
  const p = PROJECTS.find(x => x.id === id);
  return p || null;
}

app.get('/api/projects', (req, res) => {
  Promise.all(PROJECTS.map(getProjectInfo)).then(r => res.json(r));
});

function getProjectInfo(p) {
  return new Promise(resolve => {
    const win = winPath(p);
    if (!fs.existsSync(win)) return resolve({ ...p, exists: false, branch: '?', commit: 'path not found', running: !!runningDevs[p.id] });
    exec(
      `git -C "${win}" branch --show-current 2>nul & git -C "${win}" log --oneline -1 2>nul`,
      { timeout: 6000, windowsHide: true },
      (err, out) => {
        const lines  = (out || '').trim().split('\n').map(l => l.trim()).filter(Boolean);
        const branch = lines[0] || 'main';
        const commit = lines[1] ? lines[1].slice(0, 65) : 'no commits yet';
        const hasNodeModules = fs.existsSync(win + '\\node_modules');
        resolve({ ...p, exists: true, branch, commit, running: !!runningDevs[p.id], hasNodeModules });
      }
    );
  });
}

app.post('/api/project/open-vscode', (req, res) => {
  const p = findProject(req.body.id);
  if (!p) return res.status(404).json({ error: 'not found' });
  exec(`code "${winPath(p)}"`, { windowsHide: true });
  res.json({ ok: true });
});

app.post('/api/project/open-explorer', (req, res) => {
  const p = findProject(req.body.id);
  if (!p) return res.status(404).json({ error: 'not found' });
  exec(`explorer "${winPath(p)}"`, { windowsHide: true });
  res.json({ ok: true });
});

app.post('/api/project/start-dev', (req, res) => {
  const p = findProject(req.body.id);
  if (!p) return res.status(404).json({ error: 'not found' });
  if (runningDevs[p.id]) return res.status(400).json({ error: 'already running', pid: runningDevs[p.id].pid });
  const child = spawn('cmd', ['/c', 'npm run dev'], {
    cwd: winPath(p), detached: true, stdio: 'ignore', windowsHide: true,
  });
  child.unref();
  runningDevs[p.id] = { pid: child.pid, port: p.devPort };
  setTimeout(() => exec(`start http://localhost:${p.devPort}`, { windowsHide: true }), 2500);
  res.json({ ok: true, pid: child.pid, port: p.devPort });
});

app.post('/api/project/install-deps', (req, res) => {
  const p = findProject(req.body.id);
  if (!p) return res.status(404).json({ error: 'not found' });
  const child = spawn('cmd', ['/c', 'npm install'], { cwd: winPath(p), windowsHide: true, stdio: 'pipe' });
  let out = '';
  const cap = d => { if (out.length < 8192) out += d; };
  child.stdout.on('data', cap);
  child.stderr.on('data', cap);
  child.on('close', code => {
    if (code !== 0) return res.status(500).json({ error: out.slice(-500) });
    res.json({ ok: true, output: 'Dependencies installed successfully.' });
  });
});

app.post('/api/project/stop-dev', (req, res) => {
  const p = findProject(req.body.id);
  if (!p) return res.status(404).json({ error: 'not found' });
  if (!runningDevs[p.id]) return res.status(400).json({ error: 'not running' });
  exec(`taskkill /F /PID ${runningDevs[p.id].pid} /T`, { windowsHide: true }, () => {
    delete runningDevs[p.id];
    res.json({ ok: true });
  });
});

// ── Scripts ───────────────────────────────────────────────────────────────────

app.post('/api/script/run', (req, res) => {
  const s = SCRIPTS.find(x => x.id === req.body.id);
  if (!s) return res.status(404).json({ error: 'script not found' });
  exec(
    `powershell -ExecutionPolicy Bypass -File "${s.file.replace(/\//g,'\\')}"`,
    { timeout: 30000, windowsHide: true },
    (err, stdout, stderr) => {
      if (err) return res.status(500).json({ error: stderr || err.message });
      res.json({ ok: true, output: stdout.trim() || 'Script completed.' });
    }
  );
});

// ── Windows Settings ─────────────────────────────────────────────────────────

const SETTINGS = [
  // System
  { id: 'device-manager',    cat: 'System',         name: 'Device Manager',          icon: '🖥️',  cmd: 'devmgmt.msc',                              type: 'msc'     },
  { id: 'system-props',      cat: 'System',         name: 'System Properties',       icon: '⚙️',  cmd: 'sysdm.cpl',                                type: 'cpl'     },
  { id: 'task-manager',      cat: 'System',         name: 'Task Manager',            icon: '📊',  cmd: 'taskmgr.exe',                              type: 'exe'     },
  { id: 'computer-mgmt',     cat: 'System',         name: 'Computer Management',     icon: '🗂️',  cmd: 'compmgmt.msc',                             type: 'msc'     },
  { id: 'event-viewer',      cat: 'System',         name: 'Event Viewer',            icon: '📋',  cmd: 'eventvwr.msc',                             type: 'msc'     },
  { id: 'services',          cat: 'System',         name: 'Services',                icon: '⚡',  cmd: 'services.msc',                             type: 'msc'     },
  { id: 'registry',          cat: 'System',         name: 'Registry Editor',         icon: '🔑',  cmd: 'regedit.exe',                              type: 'exe'     },
  { id: 'msconfig',          cat: 'System',         name: 'System Config (msconfig)',  icon: '🛠️',  cmd: 'msconfig.exe',                             type: 'exe'     },
  { id: 'resource-monitor',  cat: 'System',         name: 'Resource Monitor',        icon: '📈',  cmd: 'resmon.exe',                               type: 'exe'     },
  { id: 'perf-monitor',      cat: 'System',         name: 'Performance Monitor',     icon: '📉',  cmd: 'perfmon.exe',                              type: 'exe'     },
  { id: 'env-vars',          cat: 'System',         name: 'Environment Variables',   icon: '🔠',  cmd: 'rundll32 sysdm.cpl,EditEnvironmentVariables', type: 'run'  },
  { id: 'group-policy',      cat: 'System',         name: 'Group Policy Editor',     icon: '📜',  cmd: 'gpedit.msc',                               type: 'msc'     },
  // Display
  { id: 'display-settings',  cat: 'Display',        name: 'Display Settings',        icon: '🖥️',  cmd: 'ms-settings:display',                      type: 'uri'     },
  { id: 'personalization',   cat: 'Display',        name: 'Personalization',         icon: '🎨',  cmd: 'ms-settings:personalization',              type: 'uri'     },
  { id: 'themes',            cat: 'Display',        name: 'Themes',                  icon: '🌓',  cmd: 'ms-settings:themes',                       type: 'uri'     },
  { id: 'night-light',       cat: 'Display',        name: 'Night Light',             icon: '🌙',  cmd: 'ms-settings:nightlight',                   type: 'uri'     },
  { id: 'taskbar',           cat: 'Display',        name: 'Taskbar Settings',        icon: '📌',  cmd: 'ms-settings:taskbar',                      type: 'uri'     },
  // Network
  { id: 'network-status',    cat: 'Network',        name: 'Network Status',          icon: '🌐',  cmd: 'ms-settings:network',                      type: 'uri'     },
  { id: 'wifi-settings',     cat: 'Network',        name: 'Wi-Fi Settings',          icon: '📶',  cmd: 'ms-settings:network-wifi',                 type: 'uri'     },
  { id: 'network-adapter',   cat: 'Network',        name: 'Network Connections',     icon: '🔌',  cmd: 'ncpa.cpl',                                 type: 'cpl'     },
  { id: 'vpn',               cat: 'Network',        name: 'VPN',                     icon: '🔒',  cmd: 'ms-settings:network-vpn',                  type: 'uri'     },
  { id: 'proxy',             cat: 'Network',        name: 'Proxy Settings',          icon: '🔁',  cmd: 'ms-settings:network-proxy',                type: 'uri'     },
  { id: 'firewall',          cat: 'Network',        name: 'Firewall',                icon: '🧱',  cmd: 'firewall.cpl',                             type: 'cpl'     },
  // Power
  { id: 'power-options',     cat: 'Power',          name: 'Power Options',           icon: '⚡',  cmd: 'powercfg.cpl',                             type: 'cpl'     },
  { id: 'sleep-settings',    cat: 'Power',          name: 'Sleep & Battery',         icon: '🔋',  cmd: 'ms-settings:powersleep',                   type: 'uri'     },
  { id: 'startup-apps',      cat: 'Power',          name: 'Startup Apps',            icon: '🚀',  cmd: 'ms-settings:startupapps',                  type: 'uri'     },
  // Storage
  { id: 'disk-management',   cat: 'Storage',        name: 'Disk Management',         icon: '💾',  cmd: 'diskmgmt.msc',                             type: 'msc'     },
  { id: 'storage-settings',  cat: 'Storage',        name: 'Storage Settings',        icon: '🗄️',  cmd: 'ms-settings:storagesense',                 type: 'uri'     },
  { id: 'disk-cleanup',      cat: 'Storage',        name: 'Disk Cleanup',            icon: '🧹',  cmd: 'cleanmgr.exe',                             type: 'exe'     },
  { id: 'defrag',            cat: 'Storage',        name: 'Defragment Drives',       icon: '🔄',  cmd: 'dfrgui.exe',                               type: 'exe'     },
  // Security
  { id: 'windows-update',    cat: 'Security',       name: 'Windows Update',          icon: '🔄',  cmd: 'ms-settings:windowsupdate',                type: 'uri'     },
  { id: 'defender',          cat: 'Security',       name: 'Windows Defender',        icon: '🛡️',  cmd: 'windowsdefender:',                         type: 'uri'     },
  { id: 'privacy',           cat: 'Security',       name: 'Privacy Settings',        icon: '👁️',  cmd: 'ms-settings:privacy',                      type: 'uri'     },
  { id: 'credential-mgr',    cat: 'Security',       name: 'Credential Manager',      icon: '🗝️',  cmd: '/name Microsoft.CredentialManager',        type: 'control' },
  { id: 'bitlocker',         cat: 'Security',       name: 'BitLocker',               icon: '🔐',  cmd: 'ms-settings:deviceencryption',             type: 'uri'     },
  // Apps
  { id: 'programs',          cat: 'Apps',           name: 'Programs & Features',     icon: '📦',  cmd: 'appwiz.cpl',                               type: 'cpl'     },
  { id: 'default-apps',      cat: 'Apps',           name: 'Default Apps',            icon: '🎯',  cmd: 'ms-settings:defaultapps',                  type: 'uri'     },
  { id: 'optional-features', cat: 'Apps',           name: 'Optional Features',       icon: '🧩',  cmd: 'ms-settings:optionalfeatures',             type: 'uri'     },
  { id: 'windows-features',  cat: 'Apps',           name: 'Windows Features On/Off', icon: '🔩',  cmd: 'optionalfeatures.exe',                     type: 'exe'     },
  // Date & Language
  { id: 'datetime',          cat: 'Date & Language',name: 'Date & Time',             icon: '🕐',  cmd: 'timedate.cpl',                             type: 'cpl'     },
  { id: 'language',          cat: 'Date & Language',name: 'Language & Region',       icon: '🌍',  cmd: 'ms-settings:regionlanguage',               type: 'uri'     },
  { id: 'region',            cat: 'Date & Language',name: 'Region Format',           icon: '📅',  cmd: 'ms-settings:regionformatting',             type: 'uri'     },
  // Devices
  { id: 'bluetooth',         cat: 'Devices',        name: 'Bluetooth',               icon: '📡',  cmd: 'ms-settings:bluetooth',                    type: 'uri'     },
  { id: 'printers',          cat: 'Devices',        name: 'Printers & Scanners',     icon: '🖨️',  cmd: 'ms-settings:printers',                     type: 'uri'     },
  { id: 'sound',             cat: 'Devices',        name: 'Sound Settings',          icon: '🔊',  cmd: 'mmsys.cpl',                                type: 'cpl'     },
  { id: 'mouse',             cat: 'Devices',        name: 'Mouse Settings',          icon: '🖱️',  cmd: 'main.cpl',                                 type: 'cpl'     },
  { id: 'keyboard',          cat: 'Devices',        name: 'Keyboard Settings',       icon: '⌨️',  cmd: 'ms-settings:typing',                       type: 'uri'     },
  // Accounts
  { id: 'accounts',          cat: 'Accounts',       name: 'Your Info',               icon: '👤',  cmd: 'ms-settings:yourinfo',                     type: 'uri'     },
  { id: 'sign-in',           cat: 'Accounts',       name: 'Sign-in Options',         icon: '🔓',  cmd: 'ms-settings:signinoptions',                type: 'uri'     },
  { id: 'other-users',       cat: 'Accounts',       name: 'Other Users',             icon: '👥',  cmd: 'ms-settings:otherusers',                   type: 'uri'     },
  { id: 'user-accounts',     cat: 'Accounts',       name: 'User Accounts (Classic)', icon: '🏠',  cmd: 'userpasswords2',                           type: 'control' },
];

app.get('/api/settings', (req, res) => res.json(SETTINGS));

app.post('/api/open-setting', (req, res) => {
  const s = SETTINGS.find(x => x.id === req.body.id);
  if (!s) return res.status(404).json({ error: 'unknown setting' });
  let command;
  if (s.type === 'uri')     command = `start ${s.cmd}`;
  else if (s.type === 'cpl')  command = `control ${s.cmd}`;
  else if (s.type === 'control') command = `control ${s.cmd}`;
  else if (s.type === 'run')  command = `rundll32 ${s.cmd.replace('rundll32 ','')}`;
  else                        command = `start "" "${s.cmd}"`;
  exec(command, { windowsHide: false }, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

// ── Running Servers (netstat) ─────────────────────────────────────────────────

const PORT_PROJECT_MAP = Object.fromEntries(PROJECTS.map(p => [p.devPort, p.name]));
const KNOWN_DEV_PORTS  = new Set([3000,3001,3002,4000,4200,5000,5001,5173,5174,5175,5176,5177,5178,5179,5180,5181,8000,8080,8081,8888]);

function getServers() {
  return new Promise(resolve => {
    exec('netstat -ano', { windowsHide: true, timeout: 8000 }, (err, out) => {
      if (err) return resolve([]);
      const seen  = new Set();
      const found = [];
      (out || '').split('\n').forEach(line => {
        const m = line.match(/TCP\s+[\d.*]+:(\d+)\s+[\d.*]+:\d+\s+LISTENING\s+(\d+)/i);
        if (!m) return;
        const port = parseInt(m[1]);
        const pid  = parseInt(m[2]);
        if (port === PORT || seen.has(port)) return;
        seen.add(port);
        const name = PORT_PROJECT_MAP[port] || (KNOWN_DEV_PORTS.has(port) ? `localhost:${port}` : null);
        if (name || KNOWN_DEV_PORTS.has(port)) {
          found.push({ port, pid, name: name || `port ${port}` });
        }
      });
      resolve(found.sort((a, b) => a.port - b.port));
    });
  });
}

app.get('/api/servers', async (req, res) => {
  res.json(await getServers());
});

app.post('/api/killall', async (req, res) => {
  const servers = await getServers();
  const killed  = [];
  for (const s of servers) {
    await new Promise(r => exec(`taskkill /F /PID ${s.pid} /T`, { windowsHide: true }, (err) => {
      killed.push({ port: s.port, pid: s.pid, ok: !err });
      r();
    }));
  }
  Object.keys(runningDevs).forEach(k => delete runningDevs[k]);
  res.json({ ok: true, killed });
});

// ── New Endpoints ─────────────────────────────────────────────────────────────

app.get('/api/history', (req, res) => res.json({ cpu: cpuHist, ram: ramHist }));

app.get('/api/network', (req, res) => {
  const nets = os.networkInterfaces();
  const ifaces = [];
  for (const [name, addrs] of Object.entries(nets)) {
    for (const addr of addrs) {
      if (!addr.internal) ifaces.push({ name, address: addr.address, family: addr.family, mac: addr.mac });
    }
  }
  res.json(ifaces);
});

app.get('/api/docker', (req, res) => {
  exec(
    'docker ps --format "{{.ID}}|||{{.Image}}|||{{.Status}}|||{{.Names}}|||{{.Ports}}"',
    { windowsHide: true, timeout: 6000 },
    (err, stdout) => {
      if (err) return res.json({ available: false, containers: [] });
      const containers = (stdout || '').trim().split('\n').filter(Boolean).map(line => {
        const [id, image, status, names, ports] = line.split('|||');
        return { id, image, status, names, ports: ports || '' };
      });
      res.json({ available: true, containers });
    }
  );
});

app.get('/api/health', (req, res) => {
  const { cpu, ram, disk } = statsCache;
  let score = 100;
  if (cpu > 90) score -= 40; else if (cpu > 75) score -= 20; else if (cpu > 50) score -= 10; else if (cpu > 30) score -= 4;
  if (ram.pct > 90) score -= 35; else if (ram.pct > 75) score -= 18; else if (ram.pct > 60) score -= 8; else if (ram.pct > 45) score -= 3;
  if (disk && disk.pct > 95) score -= 25; else if (disk && disk.pct > 85) score -= 12; else if (disk && disk.pct > 75) score -= 5;
  score = Math.max(0, Math.min(100, score));
  const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F';
  const color = score >= 90 ? '#22c55e' : score >= 75 ? '#84cc16' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444';
  res.json({ score, grade, color, details: { cpu, ram: ram.pct, disk: disk ? disk.pct : 0 } });
});

const NOTES_FILE = path.join(__dirname, 'notes.json');
function readNotes() { try { return JSON.parse(fs.readFileSync(NOTES_FILE, 'utf8')); } catch { return []; } }
function writeNotes(n) { fs.writeFileSync(NOTES_FILE, JSON.stringify(n, null, 2)); }

app.get('/api/notes', (req, res) => res.json(readNotes()));
app.post('/api/notes', (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'text required' });
  const notes = readNotes();
  const note = { id: Date.now(), text: text.trim(), created: new Date().toISOString() };
  notes.push(note);
  writeNotes(notes);
  res.json(note);
});
app.delete('/api/notes/:id', (req, res) => {
  writeNotes(readNotes().filter(n => n.id !== parseInt(req.params.id)));
  res.json({ ok: true });
});

const SAFE_ENV_KEYS = ['COMPUTERNAME','USERNAME','USERPROFILE','APPDATA','LOCALAPPDATA','TEMP','NODE_ENV','JAVA_HOME','GOPATH','GOROOT','NVM_HOME','npm_config_prefix'];
app.get('/api/env', (req, res) => {
  const result = {};
  for (const k of SAFE_ENV_KEYS) { if (process.env[k]) result[k] = process.env[k]; }
  if (process.env.PATH) result['PATH'] = process.env.PATH.split(';').filter(Boolean).slice(0, 10).join('\n');
  res.json(result);
});

app.post('/api/ports/check', (req, res) => {
  const { ports } = req.body;
  if (!Array.isArray(ports)) return res.status(400).json({ error: 'ports array required' });
  exec('netstat -ano', { windowsHide: true, timeout: 8000 }, (err, out) => {
    if (err) return res.status(500).json({ error: err.message });
    const inUse = new Set();
    (out || '').split('\n').forEach(line => {
      const m = line.match(/(?:TCP|UDP)\s+[\d.*]+:(\d+)\s+/i);
      if (m) inUse.add(parseInt(m[1]));
    });
    res.json(ports.map(p => ({ port: parseInt(p), open: inUse.has(parseInt(p)) })));
  });
});

// ── Domain / Network Tools ────────────────────────────────────────────────────

function httpGet(url, opts = {}) {
  return new Promise((resolve, reject) => {
    let parsed;
    try { parsed = new URL(url); } catch(e) { return reject(e); }
    const mod = parsed.protocol === 'https:' ? https : http;
    const req = mod.get({
      hostname: parsed.hostname,
      path: parsed.pathname + (parsed.search || ''),
      port: parsed.port || undefined,
      headers: { 'User-Agent': 'DesktopControlPanel/1.0', 'Accept': 'application/json', ...(opts.headers || {}) },
      rejectUnauthorized: false,
      timeout: opts.timeout || 12000,
    }, res => {
      let data = '';
      res.on('data', d => { if (data.length < 512000) data += d; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
  });
}

app.get('/api/tools/dns', async (req, res) => {
  const domain = (req.query.host || req.query.domain || '').trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
  if (!domain) return res.status(400).json({ error: 'host required' });
  const results = {};
  await Promise.allSettled([
    dns.resolve4(domain).then(r => { results.A = r; }).catch(e => { results.A_error = e.code; }),
    dns.resolve6(domain).then(r => { results.AAAA = r; }).catch(() => {}),
    dns.resolveMx(domain).then(r => { results.MX = r.sort((a,b) => a.priority - b.priority); }).catch(() => {}),
    dns.resolveNs(domain).then(r => { results.NS = r.sort(); }).catch(() => {}),
    dns.resolveTxt(domain).then(r => { results.TXT = r.map(t => t.join('')); }).catch(() => {}),
    dns.resolveCname(domain).then(r => { results.CNAME = r; }).catch(() => {}),
    dns.resolveSoa(domain).then(r => { results.SOA = r; }).catch(() => {}),
    dns.resolveCaa(domain).then(r => { results.CAA = r; }).catch(() => {}),
  ]);
  res.json({ domain, records: results, ts: new Date().toISOString() });
});

app.get('/api/tools/whois', async (req, res) => {
  const domain = (req.query.domain || req.query.host || '').trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
  if (!domain) return res.status(400).json({ error: 'domain required' });
  try {
    const r = await httpGet(`https://rdap.org/domain/${encodeURIComponent(domain)}`);
    const d = JSON.parse(r.body);
    const getName = (ents, role) => {
      const e = (ents || []).find(x => x.roles?.includes(role));
      return e?.vcardArray?.[1]?.find(v => v[0] === 'fn')?.[3] || null;
    };
    const getDate = (events, action) => (events || []).find(e => e.eventAction === action)?.eventDate || null;
    res.json({
      domain: d.ldhName, status: d.status || [],
      registrar: getName(d.entities, 'registrar'),
      registrant: getName(d.entities, 'registrant'),
      created: getDate(d.events, 'registration'),
      updated: getDate(d.events, 'last changed'),
      expires: getDate(d.events, 'expiration'),
      nameservers: (d.nameservers || []).map(ns => ns.ldhName),
    });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/tools/ipgeo', async (req, res) => {
  const ip = (req.query.host || req.query.ip || '').trim().replace(/^https?:\/\//, '').split('/')[0];
  if (!ip) return res.status(400).json({ error: 'host required' });
  try {
    const fields = 'status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,reverse,mobile,proxy,hosting,query';
    const r = await httpGet(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=${fields}`);
    res.json(JSON.parse(r.body));
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/tools/ssl', (req, res) => {
  const raw = (req.query.host || '').trim().replace(/^https?:\/\//, '').split('/')[0];
  if (!raw) return res.status(400).json({ error: 'host required' });
  const sock = tls.connect({ host: raw, port: 443, servername: raw, rejectUnauthorized: false, timeout: 10000 }, () => {
    try {
      const cert = sock.getPeerCertificate(true);
      const authorized = sock.authorized;
      sock.destroy();
      if (!cert?.subject) return res.status(500).json({ error: 'No certificate' });
      const now = Date.now();
      const validTo = new Date(cert.valid_to);
      const daysLeft = Math.floor((validTo - now) / 86400000);
      const san = cert.subjectaltname ? cert.subjectaltname.split(', ').map(s => s.replace(/^DNS:/,'')) : [];
      res.json({
        host: raw, valid: true, authorized,
        subject: { CN: cert.subject?.CN, O: cert.subject?.O, C: cert.subject?.C },
        issuer: { CN: cert.issuer?.CN, O: cert.issuer?.O },
        validFrom: cert.valid_from, validTo: cert.valid_to,
        daysLeft, expired: daysLeft < 0,
        fingerprint: cert.fingerprint256 || cert.fingerprint,
        serialNumber: cert.serialNumber,
        subjectAltNames: san,
        keyBits: cert.bits,
        selfSigned: cert.subject?.CN === cert.issuer?.CN,
      });
    } catch(e) { if (!res.headersSent) res.status(500).json({ error: e.message }); }
  });
  sock.on('error', e => { if (!res.headersSent) res.status(500).json({ error: e.message }); });
  sock.on('timeout', () => { sock.destroy(); if (!res.headersSent) res.status(500).json({ error: 'Timeout' }); });
});

app.get('/api/tools/headers', (req, res) => {
  let target = (req.query.url || '').trim();
  if (!target) return res.status(400).json({ error: 'url required' });
  if (!target.startsWith('http')) target = 'https://' + target;
  let parsed;
  try { parsed = new URL(target); } catch { return res.status(400).json({ error: 'Invalid URL' }); }
  const mod = parsed.protocol === 'https:' ? https : http;
  const start = Date.now();
  const r = mod.request({
    hostname: parsed.hostname,
    port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
    path: parsed.pathname + (parsed.search || '') || '/',
    method: 'GET', rejectUnauthorized: false, timeout: 12000,
    headers: { 'User-Agent': 'DesktopControlPanel/1.0', 'Accept': '*/*' },
  }, response => {
    const timing = Date.now() - start;
    const SEC_HEADERS = [
      { header: 'strict-transport-security', description: 'Forces HTTPS connections' },
      { header: 'content-security-policy',   description: 'Prevents XSS & injection' },
      { header: 'x-frame-options',           description: 'Prevents clickjacking' },
      { header: 'x-content-type-options',    description: 'Prevents MIME sniffing' },
      { header: 'x-xss-protection',          description: 'XSS filter (legacy)' },
      { header: 'referrer-policy',           description: 'Controls referrer info' },
      { header: 'permissions-policy',        description: 'Controls browser features' },
    ];
    const security = SEC_HEADERS.map(s => ({
      header: s.header, description: s.description,
      present: !!response.headers[s.header],
      value: response.headers[s.header] || null,
    }));
    res.json({ url: target, status: response.statusCode, statusText: response.statusMessage,
      headers: response.headers, timing, security,
      server: response.headers['server'] || null, powered_by: response.headers['x-powered-by'] || null });
    response.destroy();
  });
  r.on('error', e => { if (!res.headersSent) res.status(500).json({ error: e.message }); });
  r.on('timeout', () => { r.destroy(); if (!res.headersSent) res.status(500).json({ error: 'Timeout' }); });
  r.end();
});

app.get('/api/tools/ping', (req, res) => {
  const host = (req.query.host || '').trim().replace(/[^a-zA-Z0-9.\-_:]/g, '');
  if (!host) return res.status(400).json({ error: 'host required' });
  exec(`ping -n 4 "${host}"`, { windowsHide: true, timeout: 20000 }, (err, stdout) => {
    if (!stdout) return res.status(500).json({ error: err?.message || 'No output' });
    const times = [];
    (stdout.match(/time[=<]\d+ms/gi) || []).forEach(m => times.push(parseInt(m.match(/\d+/)[0])));
    res.json({ host, output: stdout.trim(),
      stats: {
        avg: times.length ? Math.round(times.reduce((a,b)=>a+b,0)/times.length)+'ms' : null,
        min: times.length ? Math.min(...times)+'ms' : null,
        max: times.length ? Math.max(...times)+'ms' : null,
        loss: stdout.match(/(\d+)%\s+loss/i)?.[1]+'%' || null,
      }
    });
  });
});

app.get('/api/tools/traceroute', (req, res) => {
  const host = (req.query.host || '').trim().replace(/[^a-zA-Z0-9.\-_]/g, '');
  if (!host) return res.status(400).json({ error: 'host required' });
  exec(`tracert -h 20 -w 2000 "${host}"`, { windowsHide: true, timeout: 90000 }, (err, stdout) => {
    if (!stdout) return res.status(500).json({ error: err?.message || 'No output' });
    const hops = stdout.trim().split('\n').filter(l => /^\s*\d+/.test(l)).map(l => {
      const num = parseInt(l.match(/^\s*(\d+)/)?.[1]);
      const timesArr = (l.match(/\d+\s*ms/gi) || []).map(t => parseInt(t));
      const avg = timesArr.length ? Math.round(timesArr.reduce((a,b)=>a+b,0)/timesArr.length)+'ms' : null;
      const host2 = l.match(/\[([^\]]+)\]/)?.[1] || l.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/)?.[0] || null;
      const name = l.match(/\[([^\]]+)\]/) ? l.match(/^\s*\d+\s+[\d\s<ms*]+\s+([^\[]+)\[/)?.[1]?.trim() || null : null;
      return { hop: num, host: name || host2 || '*', time: avg };
    });
    res.json({ host, raw: stdout.trim(), hops });
  });
});

app.get('/api/tools/blacklist', async (req, res) => {
  const ip = (req.query.ip || '').trim();
  const parts = ip.split('.');
  if (parts.length !== 4 || parts.some(p => isNaN(+p))) return res.status(400).json({ error: 'Valid IPv4 required' });
  const rev = parts.slice().reverse().join('.');
  const LISTS = [
    { name: 'Spamhaus ZEN',  host: 'zen.spamhaus.org' },
    { name: 'SpamCop',       host: 'bl.spamcop.net' },
    { name: 'SORBS Spam',    host: 'spam.dnsbl.sorbs.net' },
    { name: 'Barracuda',     host: 'b.barracudacentral.org' },
    { name: 'UCEProtect L1', host: 'dnsbl-1.uceprotect.net' },
    { name: 'UCEProtect L2', host: 'dnsbl-2.uceprotect.net' },
    { name: 'Abuse.ch',      host: 'dnsbl.abuse.ch' },
    { name: 'CBL Abuseat',   host: 'cbl.abuseat.org' },
    { name: 'DroneBL',       host: 'dnsbl.dronebl.org' },
    { name: 'SORBS HTTP',    host: 'http.dnsbl.sorbs.net' },
    { name: 'SORBS SOCKS',   host: 'socks.dnsbl.sorbs.net' },
    { name: 'Mailspike',     host: 'bl.mailspike.net' },
  ];
  const results = await Promise.allSettled(LISTS.map(l =>
    dns.resolve4(`${rev}.${l.host}`)
      .then(() => ({ list: l.name, host: l.host, listed: true }))
      .catch(() => ({ list: l.name, host: l.host, listed: false }))
  ));
  const data = results.map(r => r.value || { name: '?', list: '?', listed: false });
  res.json({ ip, results: data, listedCount: data.filter(r => r.listed).length, total: data.length });
});

app.post('/api/tools/portscan', (req, res) => {
  const host = (req.body.host || '').trim().replace(/[^a-zA-Z0-9.\-_]/g, '');
  const ports = (req.body.ports || []).map(Number).filter(p => p > 0 && p < 65536).slice(0, 50);
  if (!host || !ports.length) return res.status(400).json({ error: 'host and ports[] required' });
  Promise.allSettled(ports.map(port => new Promise(resolve => {
    const sock = new net.Socket();
    const start = Date.now();
    sock.setTimeout(2500);
    sock.on('connect', () => { sock.destroy(); resolve({ port, open: true, ms: Date.now() - start }); });
    sock.on('error',   () => { sock.destroy(); resolve({ port, open: false }); });
    sock.on('timeout', () => { sock.destroy(); resolve({ port, open: false }); });
    sock.connect(port, host);
  }))).then(r => res.json({ host, results: r.map(x => x.value) }));
});

app.get('/api/tools/rdns', async (req, res) => {
  const ip = (req.query.ip || '').trim();
  if (!ip) return res.status(400).json({ error: 'ip required' });
  try { res.json({ ip, hostnames: await dns.reverse(ip) }); }
  catch(e) { res.json({ ip, hostnames: [], error: e.code || e.message }); }
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.clear();
  console.log('\n  ╔═══════════════════════════════════════╗');
  console.log(`  ║  ⚡  DESKTOP CONTROL PANEL  →  :${PORT}  ║`);
  console.log('  ╚═══════════════════════════════════════╝\n');
  console.log(`  Open: http://localhost:${PORT}\n`);
  exec(`start http://localhost:${PORT}`, { windowsHide: true });
});
