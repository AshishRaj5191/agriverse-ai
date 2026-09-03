const test = require('node:test');
const assert = require('node:assert/strict');
const { registerUser, loginUser } = require('../src/services/authService');

test('registerUser should work in local dev mode when MongoDB is unavailable', async () => {
  const payload = {
    name: 'Local User',
    email: 'local.user@example.com',
    password: 'pass1234',
    role: 'farmer',
  };

  const result = await registerUser(payload);

  assert.equal(result.user.email, 'local.user@example.com');
  assert.equal(result.user.role, 'farmer');
  assert.ok(result.token);

  const loginResult = await loginUser({
    email: payload.email,
    password: payload.password,
  });

  assert.equal(loginResult.user.email, payload.email);
});
