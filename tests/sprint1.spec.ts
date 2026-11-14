import { test, expect } from '@playwright/test';
const baseURL = process.env.TEST_BASE_URL ?? 'http://localhost:3000';
test.use({ baseURL });
test.setTimeout(60000);
expect.configure({ timeout: 15000 });
test('Guest browses, adds a variant, and merges it on Member login', async ({ page }) => {
  test.skip(!process.env.TEST_MEMBER_LOGIN || !process.env.TEST_MEMBER_PASSWORD, 'Disposable backend fixture credentials required');
  const login = await page.request.post('/api/login', { data: { login: process.env.TEST_MEMBER_LOGIN, password: process.env.TEST_MEMBER_PASSWORD }, headers: { Origin: baseURL } });
  expect(login.ok()).toBeTruthy();
  let cart = await (await page.request.get('/api/cart')).json();
  for (const line of [...cart.lines]) {
    await page.request.delete(`/api/cart/lines/${line.variantId}?expectedVersion=${cart.version}`, { headers: { Origin: baseURL } });
    cart = await (await page.request.get('/api/cart')).json();
  }
  await page.request.post('/api/logout', { headers: { Origin: baseURL } });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Find something worth bringing home.' })).toBeVisible();
  await page.getByRole('link', { name: /Synthetic Java Guide/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Synthetic Java Guide' })).toBeVisible();
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.getByRole('heading', { name: 'Your cart' })).toBeVisible();
  await expect(page.getByText('Total: $12.50')).toBeVisible();
  await page.goto('/products');
  await page.getByRole('link', { name: /Synthetic Second Seller Item/ }).first().click();
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.getByText('Total: $22.25')).toBeVisible();
  await page.getByRole('link', { name: 'Log in to continue to checkout' }).click();
  await page.getByRole('textbox', { name: 'Login' }).fill(process.env.TEST_MEMBER_LOGIN!);
  await page.getByLabel('Password').fill(process.env.TEST_MEMBER_PASSWORD!);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByRole('heading', { name: 'Your cart' })).toBeVisible();
  await expect(page.getByText('Total: $22.25')).toBeVisible();
  await page.getByRole('button', { name: 'Remove' }).first().click();
  await expect(page.getByRole('button', { name: 'Remove' })).toHaveCount(1);
  await page.getByRole('button', { name: 'Remove' }).click();
  await expect(page.getByText('Your cart is empty.')).toBeVisible();
});
test('mobile catalog has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/products');
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
});
test('Guest cart rejects stale versions and foreign origins', async ({ request }) => {
  const cartResponse = await request.get(`${baseURL}/api/cart`);
  expect(cartResponse.ok()).toBeTruthy();
  const cart = await cartResponse.json();
  const id = '77777777-7777-7777-7777-777777777777';
  const denied = await request.put(`${baseURL}/api/cart/lines/${id}`, { headers: { Origin: 'https://foreign.example' }, data: { quantity: 1, expectedVersion: cart.version } });
  expect(denied.status()).toBe(403);
  const valid = await request.put(`${baseURL}/api/cart/lines/${id}`, { headers: { Origin: baseURL }, data: { quantity: 1, expectedVersion: cart.version } });
  expect(valid.status()).toBe(200);
  const stale = await request.put(`${baseURL}/api/cart/lines/${id}`, { headers: { Origin: baseURL }, data: { quantity: 2, expectedVersion: cart.version } });
  expect(stale.status()).toBe(409);
  expect((await stale.json()).code).toBe('STALE_VERSION');
});
test('Seller cannot open the cart', async ({ page }) => {
  test.skip(!process.env.TEST_SELLER_LOGIN || !process.env.TEST_MEMBER_PASSWORD, 'Disposable backend fixture credentials required');
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Login' }).fill(process.env.TEST_SELLER_LOGIN!);
  await page.getByLabel('Password').fill(process.env.TEST_MEMBER_PASSWORD!);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL('/');
  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: 'Cart unavailable' })).toBeVisible();
});
