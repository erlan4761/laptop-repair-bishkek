const path = require('path');
const express = require('express');
const { insertRequest } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Simple KG phone format: +996XXXXXXXXX or 0XXXXXXXXX (9 digits after the prefix).
const PHONE_REGEX = /^(\+996|0)\d{9}$/;
const MAX_FIELD_LENGTH = 500;

app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));

// Serve static frontend assets. If public/index.html does not exist yet
// (e.g. frontend-dev hasn't produced it), express.static simply won't find
// it and falls through to a 404 for "/" — the server still starts fine.
app.use(express.static(PUBLIC_DIR));

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

app.post('/api/requests', (req, res) => {
  const body = req.body || {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const model = typeof body.model === 'string' ? body.model.trim() : '';
  const problem = typeof body.problem === 'string' ? body.problem.trim() : '';

  if (!isNonEmptyString(name)) {
    return res.status(400).json({ ok: false, error: 'Укажите имя.' });
  }
  if (name.length > MAX_FIELD_LENGTH) {
    return res.status(400).json({ ok: false, error: 'Имя слишком длинное.' });
  }
  if (!isNonEmptyString(phone) || !PHONE_REGEX.test(phone)) {
    return res.status(400).json({
      ok: false,
      error: 'Некорректный номер телефона. Пример: +996700000000 или 0700000000.',
    });
  }
  if (!isNonEmptyString(problem)) {
    return res.status(400).json({ ok: false, error: 'Опишите проблему.' });
  }
  if (problem.length > MAX_FIELD_LENGTH) {
    return res.status(400).json({ ok: false, error: 'Описание проблемы слишком длинное.' });
  }
  if (model.length > MAX_FIELD_LENGTH) {
    return res.status(400).json({ ok: false, error: 'Слишком длинное название модели.' });
  }

  try {
    const id = insertRequest({ name, phone, model, problem });
    return res.status(200).json({ ok: true, id });
  } catch (err) {
    console.error('Failed to save request:', err);
    return res.status(500).json({ ok: false, error: 'Внутренняя ошибка сервера. Попробуйте позже.' });
  }
});

// Malformed JSON body -> 400, not a stack trace.
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, error: 'Некорректный формат запроса.' });
  }
  console.error('Unhandled error:', err);
  return res.status(500).json({ ok: false, error: 'Внутренняя ошибка сервера.' });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
