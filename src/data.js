// All records in this file are clearly labelled demo data.
export const CITIES = ['Pune', 'Mumbai', 'Nashik', 'Nagpur', 'Kolhapur', 'Bengaluru', 'Jaipur', 'Ahmedabad', 'Delhi'];
export const STATES = ['Maharashtra', 'Karnataka', 'Rajasthan', 'Gujarat', 'Delhi', 'Tamil Nadu', 'West Bengal', 'Kerala', 'Madhya Pradesh', 'Uttar Pradesh', 'Telangana', 'Assam', 'Other'];
export const BUSINESS_CATEGORIES = ['Handmade crafts', 'Upcycled clothing', 'Natural personal care', 'Reusable bags', 'Sustainable home decor', 'Eco-friendly packaging'];
export const SUSTAINABILITY_TYPES = ['Textile reuse', 'Natural materials', 'Plastic-free', 'Upcycled', 'Locally sourced', 'Biodegradable'];
export const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Marathi', 'Kannada', 'Gujarati', 'Tamil'];
export const EXPERTISE = ['Pricing', 'Branding', 'Product photography', 'Instagram marketing', 'Packaging', 'Business planning', 'Customer acquisition', 'Bookkeeping'];
export const AVAILABILITY = ['This week', '4 hours / month', '8 hours / month', 'Weekends only'];
export const PACKAGING = ['Plastic-free paper', 'Reusable cloth pouch', 'Recycled cardboard', 'Leaf / plant-based', 'Standard packaging'];
export const END_OF_LIFE = ['Reusable', 'Recyclable', 'Biodegradable', 'Compostable', 'Not specified'];
export const EXPENSE_CATEGORIES = ['Raw materials', 'Packaging', 'Shipping', 'Marketing', 'Wages', 'Rent & utilities', 'Other'];
export const SALE_CATEGORIES = ['Online order', 'Market / exhibition', 'Wholesale', 'Direct sale', 'Other'];
export const VERIFICATION_STAGES = ['basic_pending', 'community_pending', 'partner_pending', 'approved'];
export const VERIFICATION_LABELS = {
  not_submitted: 'Not submitted',
  submitted: 'Information Submitted',
  basic_pending: 'Basic Review Pending',
  community_pending: 'Community Review Pending',
  partner_pending: 'Partner Verification Pending',
  approved: 'Verification Approved (demo)',
};

const W = 'https://images.unsplash.com/photo-1614772887723-f43f45d455e1?auto=format&fit=crop&w=1200&q=85';

export const DEMO_BUSINESSES = [
  { id: 'asha', name: 'Asha Upcycles', founder: 'Asha Kulkarni', city: 'Pune', state: 'Maharashtra', category: 'Upcycled clothing', type: 'Textile reuse', statement: 'Giving discarded sarees a second life.', img: W, story: 'Asha began transforming her mother’s old sarees into everyday bags at her dining table. Today, she works with two local tailors to give beautiful textiles a new life.', materials: 'Pre-loved sarees, cotton lining, reclaimed thread', method: 'Small-batch stitching with local tailoring partners', packaging: 'Reusable cloth pouch', women: 3, contact: 'hello@ashaupcycles.demo' },
  { id: 'meena', name: 'Meena Crafts', founder: 'Meena Sharma', city: 'Jaipur', state: 'Rajasthan', category: 'Handmade crafts', type: 'Natural materials', statement: 'Handwoven essentials rooted in local craft.', img: '/images/woodblock-carving.jpg', story: 'Meena works with block printers and weavers in her neighbourhood to make hand-printed cotton essentials.', materials: 'Handloom cotton, natural dyes', method: 'Hand block printing and handloom weaving', packaging: 'Plastic-free paper', women: 5, contact: 'studio@meenacrafts.demo' },
  { id: 'kavya', name: 'Kavya Naturals', founder: 'Kavya Rao', city: 'Bengaluru', state: 'Karnataka', category: 'Natural personal care', type: 'Plastic-free', statement: 'Small-batch botanical care, made thoughtfully.', img: 'https://assets.vogue.in/photos/5ce41b483aeed62f25bcd8b1/4%3A3/w_1440%2Ch_1080%2Cc_limit/featured68.jpg', story: 'Kavya started making cold-process soaps for her family and now sells to neighbourhood stores in Bengaluru.', materials: 'Cold-pressed coconut oil, shea butter, herbs', method: 'Cold-process soap making in small batches', packaging: 'Plastic-free paper', women: 2, contact: 'care@kavyanaturals.demo' },
  { id: 'sana', name: 'Sana EcoPack', founder: 'Sana Sheikh', city: 'Ahmedabad', state: 'Gujarat', category: 'Eco-friendly packaging', type: 'Biodegradable', statement: 'A gentler way to wrap the things you love.', img: '/images/areca-press-entrepreneur.jpg', story: 'Sana presses fallen areca palm leaves into plates and boxes for caterers and small shops.', materials: 'Fallen areca palm leaves', method: 'Heat-pressed without chemicals or binders', packaging: 'Recycled cardboard', women: 4, contact: 'orders@sanaecopack.demo' },
  { id: 'riya', name: 'Riya Handmade', founder: 'Riya Fernandes', city: 'Mumbai', state: 'Maharashtra', category: 'Sustainable home decor', type: 'Natural materials', statement: 'Handmade details for a slower, warmer home.', img: 'https://www.daughtersofindia.net/cdn/shop/files/SewingTheSeeds-EditedPhotos-85.jpg?v=1755816226&width=1080', story: 'Riya runs a collective of six women makers creating hand-painted decor and candles.', materials: 'Soy wax, terracotta, natural pigments', method: 'Hand-poured and hand-painted', packaging: 'Plastic-free paper', women: 6, contact: 'hello@riyahandmade.demo' },
  { id: 'tara', name: 'Tara Earth Studio', founder: 'Tara Singh', city: 'Delhi', state: 'Delhi', category: 'Upcycled clothing', type: 'Upcycled', statement: 'Deadstock fabrics, reimagined for everyday.', img: 'https://images.yourstory.com/cs/wordpress/2016/04/yourstory-woman-entrepreneur.jpg', story: 'Tara collects deadstock fabric from garment units and turns it into stoles and kantha-stitched pieces.', materials: 'Deadstock cotton, kantha thread', method: 'Kantha stitching by home-based artisans', packaging: 'Reusable cloth pouch', women: 4, contact: 'studio@taraearth.demo' },
  { id: 'gauri', name: 'Gauri Bamboo Works', founder: 'Gauri Pawar', city: 'Nashik', state: 'Maharashtra', category: 'Sustainable home decor', type: 'Locally sourced', statement: 'Bamboo baskets woven by women in our village.', img: '/images/bamboo-craft-woman.jpg', story: 'Gauri organised women in her village into a weaving group that sells bamboo baskets and planters.', materials: 'Locally harvested bamboo', method: 'Hand-split and hand-woven', packaging: 'Leaf / plant-based', women: 8, contact: 'gauri@bamboo.demo' },
  { id: 'nisha', name: 'Nisha Jute Bags', founder: 'Nisha Wankhede', city: 'Nagpur', state: 'Maharashtra', category: 'Reusable bags', type: 'Plastic-free', statement: 'Strong, simple bags that replace plastic.', img: '/images/jute-bag.jpg', story: 'Nisha runs a small stitching unit in Nagpur making jute shopping bags for local grocers.', materials: 'Jute, cotton webbing', method: 'Machine stitched in a home unit', packaging: 'Standard packaging', women: 3, contact: 'nisha@jutebags.demo' },
  { id: 'sunita', name: 'Sunita Kolhapuri', founder: 'Sunita Patil', city: 'Kolhapur', state: 'Maharashtra', category: 'Handmade crafts', type: 'Natural materials', statement: 'Traditional Kolhapuri chappals, hand-stitched.', img: '/images/kolhapuri-chappal.jpg', story: 'Sunita continues her family’s Kolhapuri chappal craft and trains young women in hand-stitching.', materials: 'Vegetable-tanned leather', method: 'Hand-cut and hand-stitched', packaging: 'Recycled cardboard', women: 2, contact: 'sunita@kolhapuri.demo' },
];

const P = (id, businessId, name, price, category, img, stock, materials, verification, extra = {}) => ({ id, businessId, name, price, category, img, stock, materials, demo: true, verification, description: extra.description || '', method: extra.method || '', packaging: extra.packaging || 'Plastic-free paper', endOfLife: extra.endOfLife || 'Reusable' });

export const DEMO_PRODUCTS = [
  P('p-asha-tote', 'asha', 'Upcycled Saree Tote', 799, 'Upcycled clothing', '/images/kantha-stole.jpg', 14, 'Pre-loved saree, cotton lining', 'community_pending', { description: 'Roomy tote stitched from a pre-loved saree.', method: 'Hand-cut and machine stitched', packaging: 'Reusable cloth pouch' }),
  P('p-asha-pouch', 'asha', 'Patchwork Everyday Pouch', 399, 'Upcycled clothing', '/images/kamdani-embroidery.jpg', 4, 'Saree offcuts', 'basic_pending', { description: 'Zip pouch made from saree offcuts.' }),
  P('p-meena-print', 'meena', 'Hand Block-Printed Table Runner', 1150, 'Handmade crafts', '/images/woodblock-carving.jpg', 9, 'Handloom cotton, natural dyes', 'approved', { description: 'Block printed with hand-carved wooden blocks.', method: 'Hand block printing' }),
  P('p-meena-saree', 'meena', 'Handloom Cotton Stole', 1450, 'Handmade crafts', '/images/textile-shop-jaipur.jpg', 6, 'Handloom cotton', 'partner_pending', { description: 'Lightweight handloom stole.' }),
  P('p-kavya-soap', 'kavya', 'Herbal Cold-Process Soap', 249, 'Natural personal care', '/images/handmade-soap.jpg', 40, 'Coconut oil, shea butter, herbs', 'community_pending', { description: 'Gentle soap with herbs, wrapped in paper.', endOfLife: 'Biodegradable' }),
  P('p-kavya-neem', 'kavya', 'Neem & Tulsi Soap Bar', 199, 'Natural personal care', '/images/herbal-soap.jpg', 3, 'Neem, tulsi, cold-pressed oils', 'basic_pending', { description: 'Cleansing bar with neem and tulsi.', endOfLife: 'Biodegradable' }),
  P('p-sana-plates', 'sana', 'Areca Leaf Plates (pack of 25)', 450, 'Eco-friendly packaging', '/images/areca-leaf-plates.jpg', 30, 'Fallen areca palm leaves', 'approved', { description: 'Sturdy plates pressed from fallen leaves.', endOfLife: 'Compostable', packaging: 'Recycled cardboard' }),
  P('p-sana-wrap', 'sana', 'Recycled Kraft Gift Wrap Set', 299, 'Eco-friendly packaging', '/images/paper-packaging.jpg', 18, 'Recycled kraft paper', 'basic_pending', { description: 'Plastic-free gift wrap set.', endOfLife: 'Recyclable' }),
  P('p-riya-candle', 'riya', 'Soy Wax Candle', 549, 'Sustainable home decor', '/images/soy-candle.jpg', 12, 'Soy wax, cotton wick, glass jar', 'community_pending', { description: 'Hand-poured candle in a reusable jar.' }),
  P('p-riya-warli', 'riya', 'Warli Painted Wall Panel', 1800, 'Sustainable home decor', '/images/warli-art.jpg', 2, 'Reclaimed wood, natural pigments', 'basic_pending', { description: 'Hand-painted Warli motif panel.' }),
  P('p-tara-stole', 'tara', 'Kantha Stitched Stole', 1299, 'Upcycled clothing', '/images/kantha-stole.jpg', 7, 'Deadstock cotton, kantha thread', 'partner_pending', { description: 'Stole made from deadstock fabric with kantha stitching.' }),
  P('p-gauri-basket', 'gauri', 'Woven Bamboo Basket', 650, 'Sustainable home decor', '/images/bamboo-artisan.jpg', 11, 'Locally harvested bamboo', 'community_pending', { description: 'Hand-woven storage basket.', packaging: 'Leaf / plant-based', endOfLife: 'Biodegradable' }),
  P('p-nisha-bag', 'nisha', 'Jute Grocery Bag', 220, 'Reusable bags', '/images/jute-bag.jpg', 60, 'Jute, cotton webbing', 'basic_pending', { description: 'Strong reusable grocery bag.', packaging: 'Standard packaging' }),
  P('p-sunita-chappal', 'sunita', 'Hand-stitched Kolhapuri Chappal', 1100, 'Handmade crafts', '/images/kolhapuri-chappal.jpg', 0, 'Vegetable-tanned leather', 'community_pending', { description: 'Traditional hand-stitched chappals.', packaging: 'Recycled cardboard' }),
];

export const DEMO_MENTORS = [
  { id: 'm-nandita', name: 'Nandita Rao', city: 'Bengaluru', expertise: ['Product photography', 'Pricing'], languages: ['English', 'Kannada', 'Hindi'], availability: 'This week', years: 8, img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', demo: true },
  { id: 'm-meena', name: 'Meena Sharma', city: 'Jaipur', expertise: ['Branding', 'Instagram marketing'], languages: ['Hindi', 'English'], availability: '4 hours / month', years: 3, img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80', demo: true },
  { id: 'm-shalini', name: 'Shalini Deshmukh', city: 'Pune', expertise: ['Business planning', 'Bookkeeping', 'Pricing'], languages: ['Marathi', 'Hindi', 'English'], availability: '8 hours / month', years: 12, img: '', demo: true },
  { id: 'm-farah', name: 'Farah Qureshi', city: 'Mumbai', expertise: ['Packaging', 'Customer acquisition'], languages: ['Hindi', 'English', 'Marathi'], availability: 'Weekends only', years: 6, img: '', demo: true },
  { id: 'm-hetal', name: 'Hetal Shah', city: 'Ahmedabad', expertise: ['Instagram marketing', 'Customer acquisition'], languages: ['Gujarati', 'Hindi', 'English'], availability: 'This week', years: 5, img: '', demo: true },
];

export const DEMO_MENTEE_REQUESTS = [
  { entrepreneurName: 'Asha Kulkarni', businessName: 'Asha Upcycles', city: 'Pune', language: 'Marathi', goal: 'Product photography', message: 'I would like help photographing my saree totes in natural light.' },
  { entrepreneurName: 'Riya Fernandes', businessName: 'Riya Handmade', city: 'Mumbai', language: 'English', goal: 'Pricing', message: 'How should I price candles so I cover wax and jar costs?' },
];
