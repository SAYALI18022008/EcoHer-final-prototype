// End-to-end checks for the six required EcoHer flows.
// Start the app first (npm run dev), then: npm run test:e2e
// Optional: BASE_URL=http://127.0.0.1:5173/ npm run test:e2e
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5173/';
const PASS = 'secret123';
const results = [];
const errors = [];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.setDefaultTimeout(6000);
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('dialog', d => d.accept());

function check(name, ok, detail = '') {
  results.push({ name, ok: !!ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok || !detail ? '' : `  (${detail})`}`);
}
const go = async hash => { await page.goto(BASE + '#' + hash); await page.waitForTimeout(150); };
const hash = () => new URL(page.url()).hash;
const text = async sel => (await page.locator(sel).first().textContent())?.trim();
const body = () => page.locator('body').innerText();

async function signup(role, email, name, extra) {
  await go('signup');
  await page.fill('[name=name]', name);
  await page.fill('[name=email]', email);
  await page.fill('[name=mobile]', '9876543210');
  await page.selectOption('[name=city]', 'Pune');
  await page.selectOption('[name=state]', 'Maharashtra');
  await page.fill('[name=password]', PASS);
  await page.fill('[name=confirm]', PASS);
  await page.selectOption('[name=role]', role);
  if (extra) await extra();
  await page.click('form[data-submit] button[type=submit]');
  await page.waitForTimeout(400);
}
async function login(email, password = PASS) {
  await go('login');
  await page.fill('[name=email]', email);
  await page.fill('[name=password]', password);
  await page.click('form[data-submit] button[type=submit]');
  await page.waitForTimeout(400);
}
async function logout() { await page.click('[data-action=logout]'); await page.waitForTimeout(200); }
const accountId = email => page.evaluate(e => {
  const raw = JSON.parse(localStorage.getItem('ecoher.v2.accounts') || '[]');
  return Object.values(raw).find(a => a.email === e)?.id;
}, email);

await page.goto(BASE);
await page.evaluate(() => localStorage.clear());
await page.reload();

// ---- Flow 2 (part 1): mentor registers so the entrepreneur can request them ----
await signup('Mentor', 'mentor@test.in', 'Kiran Mentor', async () => {
  await page.check('input[name=expertise][value=Pricing]');
  await page.fill('[name=years]', '7');
  await page.selectOption('[name=availability]', 'This week');
  await page.check('input[name=mentorLanguages][value=English]');
  await page.check('input[name=mentorLanguages][value=Hindi]');
});
check('Mentor registration redirects to mentor dashboard', hash() === '#mentor');
await logout();

// ---- Flow 1: entrepreneur ----
await go('signup');
await page.click('form[data-submit] button[type=submit]');
check('Registration validation shows required-field errors', (await page.locator('.field-error, .error').count()) > 0);
await signup('Entrepreneur', 'priya@test.in', 'Priya Entrepreneur', async () => {
  await page.fill('[name=businessName]', 'Priya Jute Studio');
  await page.selectOption('[name=businessCategory]', 'Reusable bags');
  await page.selectOption('[name=sustainabilityCategory]', 'Plastic-free');
  await page.fill('[name=businessLocation]', 'Kothrud, Pune');
});
check('Entrepreneur registration redirects to entrepreneur dashboard', hash() === '#entrepreneur');
await logout();
check('Logout returns to home', ['', '#home'].includes(hash()));
await login('priya@test.in', 'wrongpass1');
check('Login rejects an incorrect password', (await body()).includes('Incorrect password'));
await login('nobody@test.in');
check('Login rejects an unknown account', (await body()).includes('No account found'));
await login('priya@test.in');
check('Login with correct credentials opens entrepreneur dashboard', hash() === '#entrepreneur');

await go('entrepreneur/products');
await page.click('[data-action=newProduct]');
await page.fill('.modal [name=name]', 'Jute Market Tote');
await page.selectOption('.modal [name=category]', 'Reusable bags');
await page.fill('.modal [name=price]', '450');
await page.fill('.modal [name=stock]', '3');
await page.fill('.modal [name=description]', 'Strong hand-stitched jute tote.');
await page.fill('.modal [name=materials]', 'Jute, cotton lining');
await page.selectOption('.modal [name=packaging]', 'Plastic-free paper');
await page.selectOption('.modal [name=endOfLife]', 'Reusable');
await page.click('form[data-submit=saveProduct] button[type=submit]');
await page.waitForTimeout(300);
check('Adding a product opens the sustainability verification modal', await page.locator('form[data-submit=submitVerification]').isVisible());
await page.fill('.modal [name=composition]', '90% jute, 10% cotton');
await page.selectOption('.modal [name=recycled]', 'Partly');
await page.selectOption('.modal [name=plasticFree]', 'Yes');
await page.selectOption('.modal [name=localSourcing]', 'Yes');
await page.fill('.modal [name=production]', 'Stitched at home in small batches');
await page.click('form[data-submit=submitVerification] button[type=submit]');
await page.waitForTimeout(200);
await go('entrepreneur/verification');
const status = async () => page.locator('[data-status]').first().getAttribute('data-status');
check('Submitted product is Basic Review Pending', (await status()) === 'basic_pending');
check('Approval is not offered before earlier review stages', (await page.locator('[data-action=approveReview]').count()) === 0);
await page.click('[data-action=advanceReview]'); await page.waitForTimeout(150);
await page.click('[data-action=advanceReview]'); await page.waitForTimeout(150);
check('Review advances to Partner Verification Pending', (await status()) === 'partner_pending');
await page.click('[data-action=approveReview]'); await page.waitForTimeout(150);
check('Explicit demo approval sets Verification Approved', (await status()) === 'approved');

await go('entrepreneur/finance');
const addTx = async (type, category, amount, description, units = '') => {
  await page.selectOption('form[data-submit=saveTx] [name=type]', type);
  await page.selectOption('form[data-submit=saveTx] [name=category]', category);
  await page.fill('form[data-submit=saveTx] [name=amount]', amount);
  await page.fill('form[data-submit=saveTx] [name=description]', description);
  await page.fill('form[data-submit=saveTx] [name=units]', units);
  await page.click('form[data-submit=saveTx] button[type=submit]');
  await page.waitForTimeout(200);
};
await addTx('sale', 'Online order', '-5', 'Bad entry');
check('Finance rejects a negative amount', (await body()).includes('Enter an amount greater than ₹0'));
await addTx('sale', 'Online order', '1200', 'Two totes', '2');
await addTx('expense', 'Raw materials', '200', 'Jute roll');
check('Sale and expense update estimated profit to ₹1,000', (await text('#finProfit')) === '₹1,000', await text('#finProfit'));
check('Low-stock warning shown for stock of 3', (await body()).includes('Low stock: Jute Market Tote'));

await go('entrepreneur/coach');
const replies = () => page.locator('.chat-log .msg').count();
const before = await replies();
await page.click('[data-intent=pricing]');
await page.waitForTimeout(800);
const reply = (await page.locator('.chat-log .msg.assistant').last().textContent()) || '';
check('AI Business Coach answers a suggested question using saved data', (await replies()) > before && reply.includes('₹450'), reply);
await page.fill('#coachInput', 'What is the weather on Mars?');
await page.press('#coachInput', 'Enter');
await page.waitForTimeout(800);
check('AI Business Coach has a fallback for unknown questions', ((await page.locator('.chat-log .msg.assistant').last().textContent()) || '').includes('rule-based'));

const mentorId = await accountId('mentor@test.in');
await go('entrepreneur/mentors');
await page.click(`[data-action=requestMentor][data-id="${mentorId}"]`);
await page.fill('.modal [name=message]', 'Please help me price my jute totes.');
await page.click('form[data-submit=sendMentorRequest] button[type=submit]');
await page.waitForTimeout(200);
check('Entrepreneur sends a mentorship request', (await body()).includes('Kiran Mentor'));
await logout();

// ---- Flow 2 (part 2): mentor accepts / rejects ----
await login('mentor@test.in');
check('Mentor login opens mentor dashboard', hash() === '#mentor');
await go('mentor/requests');
const priyaReq = page.locator('article.panel', { hasText: 'Priya Entrepreneur' });
check('Mentor sees the incoming request', (await priyaReq.count()) === 1);
await priyaReq.locator('[data-action=acceptRequest]').click(); await page.waitForTimeout(200);
await page.locator('[data-action=rejectRequest]').first().click(); await page.waitForTimeout(200);
await go('mentor/active');
check('Accepted request appears under accepted mentees', (await body()).includes('Priya Entrepreneur'));
await go('mentor/history');
check('Rejected request appears in history', /declined/i.test(await body()));
await logout();

// ---- Flow 3: customer ----
await go('signup');
await page.selectOption('[name=role]', 'Customer');
check('Customer signup shows no entrepreneur or mentor fields', !(await page.locator('[name=businessName]').isVisible()) && !(await page.locator('[name=years]').isVisible()));
await signup('Customer', 'meera@test.in', 'Meera Customer');
check('Customer registration redirects to customer dashboard', hash() === '#customer');
await logout();
await login('meera@test.in');
await go('customer/browse');
await page.locator('select', { has: page.locator('option[value="Jaipur"]') }).first().selectOption('Jaipur');
await page.waitForTimeout(200);
const cards = page.locator('article.product-card');
const cardTexts = await cards.allInnerTexts();
check('City filter shows only Jaipur products', cardTexts.length > 0 && cardTexts.every(t => t.includes('Jaipur')), `${cardTexts.length} cards`);
await cards.first().locator('[data-action=viewProduct]').click();
await page.waitForTimeout(200);
check('Product details show sustainability verification', /Sustainability verification/i.test(await page.locator('.modal').innerText()));
await page.keyboard.press('Escape');
await cards.first().locator('[data-action=addToCart]').click();
await page.waitForTimeout(200);
check('Add to cart updates cart count', (await text('#cartCount')) === '1');
await go('customer/cart');
await page.click('[data-action=openCheckout]');
check('Checkout is clearly simulated', (await page.locator('.modal').innerText()).includes('No payment details are collected'));
await page.fill('.modal [name=shipAddress]', '12 MG Road');
await page.click('form[data-submit=placeOrder] button[type=submit]');
await page.waitForTimeout(300);
check('Simulated checkout shows demo order confirmation', (await body()).includes('Demo order confirmed'));
await page.keyboard.press('Escape');
await go('customer/orders');
check('Demo order appears in order history', (await page.locator('main').innerText()).includes('₹'));

// ---- Flow 6: role guards ----
await go('entrepreneur');
check('Customer is blocked from entrepreneur dashboard', hash() === '#customer');
await go('mentor/requests');
check('Customer is blocked from mentor dashboard', hash() === '#customer');

// ---- Flow 4: live language switching ----
await go('home');
await page.selectOption('#langSelect', 'hi');
await page.waitForTimeout(200);
check('Hindi applies immediately on home page', (await body()).includes('होम'));
await go('customer/browse');
check('Hindi persists after navigation', (await body()).includes('बाज़ार'));
await page.selectOption('#langSelect', 'mr');
await page.waitForTimeout(200);
check('Marathi applies immediately on customer dashboard', (await body()).includes('बाजारपेठ'));
await page.selectOption('#langSelect', 'en');
await page.waitForTimeout(200);
check('Switching back to English works', (await body()).includes('Marketplace'));
await logout();
await go('signup');
await page.fill('[name=name]', 'Half Filled');
await page.selectOption('#langSelect', 'mr');
await page.waitForTimeout(200);
check('Language switch keeps form input and translates labels', (await page.inputValue('[name=name]')) === 'Half Filled' && (await body()).includes('पूर्ण नाव'));

// ---- Flow 5: refresh persistence ----
await page.reload();
await page.waitForTimeout(200);
check('Language preference persists after refresh', (await page.evaluate(() => document.documentElement.lang)) === 'mr' && (await body()).includes('पूर्ण नाव'));
await page.selectOption('#langSelect', 'en');
await login('meera@test.in');
await go('customer/browse');
await page.locator('article.product-card [data-action=addToCart]').first().click();
await page.waitForTimeout(150);
await page.reload();
await page.waitForTimeout(200);
check('Session and cart persist after refresh', hash() === '#customer/browse' && (await text('#cartCount')) === '1');
await go('customer/orders');
check('Demo orders persist after refresh', (await page.locator('main').innerText()).includes('₹'));
await logout();
await login('priya@test.in');
await page.reload();
await go('entrepreneur/finance');
check('Entrepreneur finance persists after refresh', (await text('#finProfit')) === '₹1,000');
await go('entrepreneur/products');
check('Entrepreneur products persist after refresh', (await body()).includes('Jute Market Tote'));
await go('entrepreneur/mentors');
check('Mentor decision visible to entrepreneur', /accepted/i.test(await page.locator('main').innerText()));
await go('customer');
check('Entrepreneur is blocked from customer dashboard', hash() === '#entrepreneur');
await logout();
await go('entrepreneur');
check('Logged-out user is sent to login from a protected route', hash() === '#login');

check('No JavaScript errors in the browser console', errors.length === 0, errors.join(' | '));
await browser.close();
const failed = results.filter(r => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
