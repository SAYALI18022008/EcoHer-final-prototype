import { t } from './i18n.js';
import { inr } from './utils.js';
import { EXPENSE_CATEGORIES } from './data.js';

export const SUGGESTED = [
  ['sales', 'How can I increase my sales?'],
  ['pricing', 'How should I price my products?'],
  ['promotion', 'How can I promote my business with a small budget?'],
  ['expenses', 'How can I reduce expenses?'],
  ['customers', 'How can I attract more customers?'],
  ['descriptions', 'How can I improve my product descriptions?'],
  ['sustainability', 'How can I improve my sustainability practices?'],
  ['week', 'What should I focus on this week?'],
];

const KEYWORDS = {
  pricing: ['price', 'pricing', 'cost', 'margin', 'कीमत', 'मूल्य', 'किंमत', 'दाम'],
  expenses: ['expense', 'reduce', 'save money', 'spend', 'खर्च', 'बचत'],
  promotion: ['promot', 'budget', 'instagram', 'whatsapp', 'social', 'market', 'प्रचार', 'जाहिरात'],
  customers: ['customer', 'attract', 'buyer', 'ग्राहक'],
  descriptions: ['description', 'listing', 'photo', 'write', 'विवरण', 'वर्णन'],
  sustainability: ['sustainab', 'eco', 'green', 'packaging', 'plastic', 'टिकाऊ', 'शाश्वत', 'पर्यावरण'],
  week: ['week', 'focus', 'today', 'priority', 'सप्ताह', 'आठवड', 'प्राथमिकता'],
  stock: ['stock', 'inventory', 'स्टॉक', 'साठा'],
  verification: ['verif', 'badge', 'certif', 'सत्यापन', 'पडताळणी'],
  sales: ['sale', 'sell', 'revenue', 'income', 'grow', 'बिक्री', 'विक्री', 'कमाई'],
  greeting: ['hello', 'hi ', 'namaste', 'नमस्ते', 'नमस्कार'],
};

export function detectIntent(text) {
  const q = ` ${String(text).toLowerCase()} `;
  for (const [intent, words] of Object.entries(KEYWORDS)) if (words.some(w => q.includes(w))) return intent;
  return 'fallback';
}

/** ctx: { business, products, totals:{revenue,expenses,profit}, finance, lowStock, unverified, impact } */
export function respond(intent, ctx) {
  const { business: b, products, totals, finance, lowStock, unverified } = ctx;
  const lines = [];
  const prices = products.map(p => Number(p.price)).filter(Boolean);
  const sales = finance.filter(f => f.type === 'sale');
  const expenses = finance.filter(f => f.type === 'expense');
  switch (intent) {
    case 'sales':
      lines.push(t('Here is a practical plan to grow sales for {name}:', { name: b.name }));
      if (!sales.length) lines.push(t('• You have not recorded any sales yet. Add each sale in Finance so you can see which products and channels work.'));
      else lines.push(t('• You have recorded {n} sales worth {amount}. Repeat what worked: contact those customers again with a new product or a refill offer.', { n: sales.length, amount: inr(totals.revenue) }));
      if (products.length) lines.push(t('• Feature your best product "{product}" first in your catalogue and WhatsApp status.', { product: products[0].name }));
      else lines.push(t('• Add at least three products with clear photos so customers have choices.'));
      lines.push(t('• Offer a small bundle (for example two items together) to increase the value of each order.'));
      if (unverified) lines.push(t('• {n} of your products have no submitted sustainability information. Customers trust listings that explain materials.', { n: unverified }));
      break;
    case 'pricing':
      lines.push(t('Use this simple pricing formula: price = (materials + labour + packaging + shipping share) × (1 + profit margin).'));
      lines.push(t('• Aim for a 30–50% margin for handmade work so you are paid for your time.'));
      if (prices.length > 1 && Math.min(...prices) !== Math.max(...prices)) lines.push(t('• Your products currently range from {min} to {max}. Check that the lowest-priced item still covers its full cost.', { min: inr(Math.min(...prices)), max: inr(Math.max(...prices)) }));
      else if (prices.length) lines.push(t('• Your products are currently priced at {price}. Check that this covers the full cost of materials, labour and packaging.', { price: inr(prices[0]) }));
      if (totals.revenue > 0) lines.push(t('• Your estimated profit margin so far is {pct}%.', { pct: Math.round((totals.profit / totals.revenue) * 100) }));
      lines.push(t('• Write the cost of each product down once a month — raw material prices change.'));
      break;
    case 'promotion':
      lines.push(t('Low-budget promotion ideas:'));
      lines.push(t('• Post one short video a week showing your hands making the product. Process videos build trust.'));
      lines.push(t('• Use WhatsApp Business catalogues and ask happy customers to forward them.'));
      lines.push(t('• Join a local exhibition or weekend market in {city} with other women-led businesses to share stall costs.', { city: b.city || t('your city') }));
      lines.push(t('• Tell your founder story on your EcoHer profile — profiles with a story feel more personal.'));
      break;
    case 'expenses': {
      if (!expenses.length) { lines.push(t('You have not recorded expenses yet. Add them in Finance so I can show where your money goes.')); break; }
      const byCat = {};
      expenses.forEach(e => { byCat[e.category] = (byCat[e.category] || 0) + Number(e.amount); });
      const [top, amt] = Object.entries(byCat).sort((a, c) => c[1] - a[1])[0];
      lines.push(t('Your biggest expense category is {cat} at {amount} ({pct}% of expenses).', { cat: t(top), amount: inr(amt), pct: Math.round((amt / totals.expenses) * 100) }));
      lines.push(t('• Buy raw materials in bulk with another maker to get better rates.'));
      lines.push(t('• Reuse clean boxes and cloth for packaging instead of buying new.'));
      lines.push(t('• Batch shipping on fixed days to reduce courier trips.'));
      if (!EXPENSE_CATEGORIES.includes(top)) lines.push(t('• Review this category each month.'));
      break;
    }
    case 'customers':
      lines.push(t('Ways to attract more customers:'));
      lines.push(t('• Make your profile complete: story, location, contact preference and clear photos.'));
      lines.push(t('• Answer messages within a day — quick replies turn interest into orders.'));
      lines.push(t('• Offer a first-order thank-you note or small sample in the parcel.'));
      lines.push(t('• Partner with a local café or boutique to display a few products.'));
      break;
    case 'descriptions':
      lines.push(t('A strong product description answers: what is it, what is it made of, who made it, how to use and care for it.'));
      if (products.length) {
        const p = products.find(x => !x.description || x.description.length < 60) || products[0];
        lines.push(t('• "{product}" could say more. Add size, materials ({materials}) and how it is made.', { product: p.name, materials: p.materials || t('not listed') }));
      }
      lines.push(t('• Use natural-light photos from three angles and one photo in use.'));
      lines.push(t('• Avoid vague claims like "100% eco-friendly" — describe the actual material and packaging instead.'));
      break;
    case 'sustainability':
      lines.push(t('Practical sustainability steps:'));
      lines.push(t('• Switch to plastic-free paper or cloth packaging and say so honestly in your listing.'));
      lines.push(t('• Keep supplier bills that show where materials come from — useful evidence for verification.'));
      lines.push(t('• Track waste you reuse (in kg) in the Impact section so your numbers are based on records.'));
      if (unverified) lines.push(t('• Submit sustainability information for {n} product(s) that have none yet.', { n: unverified }));
      break;
    case 'stock':
      if (lowStock.length) lines.push(t('These products are low on stock: {list}. Restock or mark them clearly so customers are not disappointed.', { list: lowStock.map(p => `${p.name} (${p.stock})`).join(', ') }));
      else lines.push(t('None of your products are low on stock right now.'));
      break;
    case 'verification':
      lines.push(t('Verification in this prototype is a simulated flow: Information Submitted → Basic Review → Community Review → Partner Verification → Approved.'));
      lines.push(t('• Fill in material composition, packaging and production details honestly, and describe any evidence you hold.'));
      break;
    case 'week':
      lines.push(t('Your focus for this week:'));
      if (!products.length) lines.push(t('1. Add your first products with photos and prices.'));
      if (lowStock.length) lines.push(t('• Restock: {list}.', { list: lowStock.map(p => p.name).join(', ') }));
      if (unverified) lines.push(t('• Submit sustainability information for {n} product(s).', { n: unverified }));
      if (!sales.length) lines.push(t('• Record your sales and expenses so your profit is accurate.'));
      else lines.push(t('• Your estimated profit is {amount}. Review your top expense and one price.', { amount: inr(totals.profit) }));
      if (!b.story) lines.push(t('• Write your business story on your profile.'));
      lines.push(t('• Share one behind-the-scenes post with your customers.'));
      break;
    case 'greeting':
      lines.push(t('Namaste! Ask me about sales, pricing, promotion, expenses, customers, product descriptions or sustainability.'));
      break;
    default:
      lines.push(t('I am a simple rule-based assistant and did not understand that question. Try asking about sales, pricing, promotion, expenses, customers, product descriptions, stock, verification or your weekly focus.'));
  }
  return lines.join('\n');
}
