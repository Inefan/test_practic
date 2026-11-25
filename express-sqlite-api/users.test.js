const { test } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

process.env.DB_FILE = ':memory:'; // тестова база в пам'яті, app.db не чіпаємо
const app = require('../app');

test('створення користувача та отримання його за id', async () => {
  // 1. Створюємо
  const created = await request(app)
    .post('/users')
    .send({ name: 'Oleg', role: 'admin' })
    .expect(201);

  assert.strictEqual(created.body.name, 'Oleg');

  // 2. Отримуємо за id
  const res = await request(app)
    .get(`/users/${created.body.id}`)
    .expect(200);

  assert.strictEqual(res.body.role, 'admin');
});

test('користувача без role не створено', async () => {
  await request(app)
    .post('/users')
    .send({ name: 'NoRole' })
    .expect(400);
});

test('неіснуючий користувач повертає 404', async () => {
  await request(app).get('/users/9999').expect(404);
});
