const { test } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

process.env.DB_FILE = ':memory:';
const app = require('../app');

test('замовлення показує ім\'я покупця і видаляється разом з ним', async () => {
  // 1. Покупець
  const user = await request(app)
    .post('/users')
    .send({ name: 'Pavlo', role: 'user' })
    .expect(201);

  // 2. Замовлення для нього
  await request(app)
    .post('/orders')
    .send({ user_id: user.body.id, product: 'Smartphone', amount: 800 })
    .expect(201);

  // 3. У списку замовлень є ім'я покупця (JOIN)
  let orders = await request(app).get('/orders').expect(200);
  assert.strictEqual(orders.body.length, 1);
  assert.strictEqual(orders.body[0].user_name, 'Pavlo');

  // 4. Видаляємо покупця → замовлення зникає (CASCADE)
  await request(app).delete(`/users/${user.body.id}`).expect(204);
  orders = await request(app).get('/orders').expect(200);
  assert.strictEqual(orders.body.length, 0);
});
