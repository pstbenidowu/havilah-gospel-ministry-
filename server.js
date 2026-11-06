// Havilah Gospel Ministries Int'l — web server + admin API (no database install needed).
const express = require('express'), multer = require('multer'), crypto = require('crypto');
const fs = require('fs'), path = require('path');
try { fs.readFileSync('.env', 'utf8').split('\n').forEach(l => { const m = l.match(/^(\w+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2]; }); } catch {}

const PASSWORD = process.env.ADMIN_PASSWORD || 'havilah-admin';
const DB = path.join(__dirname, 'data', 'db.json');
const UPLOADS = path.join(__dirname, 'uploads');
// Add a new content type here and it appears in the admin dashboard automatically.
const COLLECTIONS = ['gallery', 'audio', 'devotionals', 'programs', 'departments', 'books', 'sermons'];
const FORMS = ['prayer', 'testimonies', 'partnership', 'contact'];

const load = () => { try { return JSON.parse(fs.readFileSync(DB, 'utf8')); } catch { return {}; } };
const save = d => fs.writeFileSync(DB, JSON.stringify(d, null, 1));
const list = (d, k) => d[k] || [];

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS,
    filename: (_, f, cb) => cb(null, Date.now() + '-' + crypto.randomBytes(3).toString('hex') + path.extname(f.originalname).toLowerCase()),
  }),
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_, f, cb) => cb(null, /^(image|audio|video)\//.test(f.mimetype) || f.mimetype === 'application/pdf'),
});

const tokens = new Set();
const auth = (req, res, next) => tokens.has(req.get('x-token')) ? next() : res.status(401).json({ error: 'Please log in' });
const clean = s => String(s || '').slice(0, 5000);

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(UPLOADS));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/login', (req, res) => {
  if (req.body.password !== PASSWORD) return res.status(401).json({ error: 'Wrong password' });
  const t = crypto.randomBytes(24).toString('hex'); tokens.add(t); res.json({ token: t });
});

// Public: read content
app.get('/api/content/:c', (req, res) => {
  const c = req.params.c;
  if (!COLLECTIONS.includes(c) && c !== 'testimonies') return res.status(404).end();
  let items = list(load(), c);
  if (c === 'testimonies') items = items.filter(i => i.approved);
  res.json(items.slice().reverse());
});

// Public: submit forms
const hits = {};
app.post('/api/submit/:f', (req, res) => {
  const f = req.params.f;
  if (!FORMS.includes(f)) return res.status(404).end();
  const ip = req.ip, now = Date.now();
  hits[ip] = (hits[ip] || []).filter(t => now - t < 600000);
  if (hits[ip].length >= 5 || req.body.website) return res.status(429).json({ error: 'Too many submissions. Please try again later.' });
  hits[ip].push(now);
  const item = { id: crypto.randomUUID(), date: new Date().toISOString(), approved: false };
  ['name', 'email', 'phone', 'message', 'type'].forEach(k => item[k] = clean(req.body[k]));
  if (!item.name || !item.message) return res.status(400).json({ error: 'Name and message are required' });
  const d = load(); (d[f] = list(d, f)).push(item); save(d); res.json({ ok: true });
});

// Admin: add / delete content
app.post('/api/admin/:c', auth, upload.single('file'), (req, res) => {
  const c = req.params.c;
  if (!COLLECTIONS.includes(c)) return res.status(404).end();
  const item = { id: crypto.randomUUID(), date: new Date().toISOString() };
  for (const [k, v] of Object.entries(req.body)) item[k] = clean(v);
  if (req.file) item.file = '/uploads/' + req.file.filename;
  const d = load(); (d[c] = list(d, c)).push(item); save(d); res.json(item);
});
app.get('/api/admin/inbox/:f', auth, (req, res) => res.json(list(load(), req.params.f).slice().reverse()));
app.post('/api/admin/inbox/:f/:id/approve', auth, (req, res) => {
  const d = load(), i = list(d, req.params.f).find(x => x.id === req.params.id);
  if (i) { i.approved = !i.approved; save(d); } res.json({ ok: true });
});
app.delete('/api/admin/:c/:id', auth, (req, res) => {
  const c = req.params.c;
  if (![...COLLECTIONS, ...FORMS].includes(c)) return res.status(404).end();
  const d = load(), item = list(d, c).find(x => x.id === req.params.id);
  if (item && item.file) fs.unlink(path.join(__dirname, item.file), () => {});
  d[c] = list(d, c).filter(x => x.id !== req.params.id); save(d); res.json({ ok: true });
});

app.use((e, _, res, __) => res.status(500).json({ error: e.message }));
app.listen(process.env.PORT || 3000, () => console.log('Havilah site running on port ' + (process.env.PORT || 3000)));
