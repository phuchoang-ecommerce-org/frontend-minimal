import { test, expect } from "@playwright/test";

const baseURL = process.env.TEST_BASE_URL ?? "http://localhost:3000";
test.use({ baseURL });
test.setTimeout(90000);
test.describe.configure({ mode: "serial" });

test("development account buttons use the server-side login action", async ({ page }) => {
  test.skip(process.env.TEST_DEV_QUICK_LOGIN !== "1", "Enable with a local dev frontend and seeded backend");
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Development accounts" })).toBeVisible();
  await page.getByRole("button", { name: "Log in as Member" }).click();
  await expect(page).toHaveURL(/\/cart$/);
  await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
});

test("checkout mutation requires a Member and same Origin", async ({ request }) => {
  const unauthenticated = await request.post("/api/orders", { headers: { Origin: baseURL, "Idempotency-Key": crypto.randomUUID() }, data: { addressId: crypto.randomUUID(), cartVersion: 0, paymentMethod: "COD" } });
  expect(unauthenticated.status()).toBe(401);
  const foreign = await request.post("/api/orders", { headers: { Origin: "https://foreign.example", "Idempotency-Key": crypto.randomUUID() }, data: { addressId: crypto.randomUUID(), cartVersion: 0, paymentMethod: "COD" } });
  expect(foreign.status()).toBe(403);
});

test("Member checkout, two Seller payments, and cancellation states", async ({ page }) => {
  test.skip(!process.env.TEST_MEMBER_LOGIN || !process.env.TEST_MEMBER_PASSWORD || !process.env.TEST_SELLER_LOGIN || !process.env.TEST_SELLER_B_LOGIN, "Disposable fixture accounts and two Seller products required");
  const password = process.env.TEST_MEMBER_PASSWORD!;
  async function login(loginName: string) {
    await page.goto("/login");
    await page.getByRole("textbox", { name: "Login" }).fill(loginName);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Log in" }).click();
  }
  async function logout() { await page.getByRole("button", { name: "Log out" }).click(); }
  async function addProduct(name: RegExp) {
    await page.goto("/products");
    await page.getByRole("link", { name }).first().click();
    await page.getByRole("button", { name: "Add to cart" }).click();
  }
  await login(process.env.TEST_MEMBER_LOGIN!);
  let cart = await (await page.request.get("/api/cart")).json();
  for (const line of [...cart.lines]) {
    await page.request.delete(`/api/cart/lines/${line.variantId}?expectedVersion=${cart.version}`, { headers: { Origin: baseURL } });
    cart = await (await page.request.get("/api/cart")).json();
  }
  await addProduct(/Synthetic Java Guide/);
  await addProduct(/Synthetic Second Seller Item/);
  await page.goto("/checkout");
  await expect(page.getByRole("heading", { name: "Place your order" })).toBeVisible();
  const addresses = page.locator('input[name="address"]');
  expect(await addresses.count()).toBeGreaterThan(0);
  await addresses.first().check();
  let firstRequest: { key: string | null; body: string | null } | null = null;
  await page.route("**/api/orders", async (route) => {
    if (route.request().method() !== "POST" || firstRequest) return route.continue();
    firstRequest = { key: route.request().headers()["idempotency-key"] ?? null, body: route.request().postData() };
    await route.fetch();
    await route.abort("failed");
  });
  await page.getByRole("button", { name: "Place COD order" }).click();
  await expect(page.getByRole("button", { name: "Retry same order" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Retry same order" })).toBeVisible();
  const replay = page.waitForRequest((request) => request.url().endsWith("/api/orders") && request.method() === "POST");
  await page.getByRole("button", { name: "Retry same order" }).click();
  const retried = await replay;
  expect(retried.headers()["idempotency-key"]).toBe(firstRequest!.key);
  expect(retried.postData()).toBe(firstRequest!.body);
  await expect(page).toHaveURL(/\/orders\/[0-9a-f-]+$/);
  const paidOrderUrl = page.url();
  const placedOrder = await (await page.request.get(`/api/orders/${paidOrderUrl.split("/").pop()}`)).json();
  await expect(page.getByText("Pending payment").first()).toBeVisible();
  await logout();
  for (const seller of [process.env.TEST_SELLER_LOGIN!, process.env.TEST_SELLER_B_LOGIN!]) {
    await login(seller);
    await page.goto("/seller/orders");
    await expect(page.getByRole("heading", { name: "Seller orders" })).toBeVisible();
    const buttons = page.getByRole("button", { name: "Record COD cash" });
    await expect(buttons.first()).toBeVisible();
    const own = await (await page.request.get("/api/seller/orders")).json();
    const foreign = placedOrder.sellerOrders.find((part: { id: string }) => part.id !== own.items[0].id);
    expect((await page.request.post(`/api/seller/orders/${foreign.id}/mark-paid`, { headers: { Origin: baseURL } })).status()).toBe(404);
    await buttons.first().click();
    await expect(page.getByText("Cash receipt recorded.")).toBeVisible();
    expect((await page.request.post(`/api/seller/orders/${own.items[0].id}/mark-paid`, { headers: { Origin: baseURL } })).status()).toBe(409);
    await logout();
  }
  await login(process.env.TEST_MEMBER_LOGIN!);
  await page.goto(paidOrderUrl);
  await page.getByRole("button", { name: "Refresh status" }).click();
  await expect(page.getByRole("heading", { name: "Paid" })).toBeVisible();
  expect((await page.request.post(`/api/orders/${placedOrder.id}/cancellation`, { headers: { Origin: baseURL } })).status()).toBe(409);
  await expect(page.getByText("This order cannot be cancelled because a Seller has recorded payment.")).toBeVisible();
  await addProduct(/Synthetic Java Guide/);
  await page.goto("/checkout");
  await addresses.first().check();
  await page.getByRole("button", { name: "Place COD order" }).click();
  await expect(page).toHaveURL(/\/orders\/[0-9a-f-]+$/);
  await page.getByRole("button", { name: "Cancel unpaid order" }).click();
  await expect(page.getByRole("heading", { name: "Cancelled" })).toBeVisible();
});
