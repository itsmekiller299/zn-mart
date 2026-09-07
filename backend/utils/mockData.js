const categories = [
  // Main categories
  { _id: '6a9b8882c4a92a5ddf7d5efd', name: 'Electronics', description: 'Gadgets and gizmos', image: { url: '/images/product1.png', public_id: 'cat1' }, parent: null },
  { _id: '6a9b8882c4a92a5ddf7d5efe', name: 'Fashion', description: 'Trendy apparel - Main', image: { url: '/images/product2.png', public_id: 'cat2' }, parent: null },
  { _id: '6a9b8882c4a92a5ddf7d5eff', name: 'Home & Garden', description: 'Everything for your home', image: { url: '/images/product3.png', public_id: 'cat3' }, parent: null },
  // Subcategories under Fashion
  { _id: '6a9b8882c4a92a5ddf7d5f10', name: 'Mens', description: 'Mens fashion - shirts, pants, t-shirts', image: { url: '/images/product2.png', public_id: 'cat_mens' }, parent: '6a9b8882c4a92a5ddf7d5efe' },
  { _id: '6a9b8882c4a92a5ddf7d5f11', name: 'Womens', description: 'Womens fashion - dresses, tops, sarees', image: { url: '/images/product2.png', public_id: 'cat_womens' }, parent: '6a9b8882c4a92a5ddf7d5efe' },
  { _id: '6a9b8882c4a92a5ddf7d5f12', name: 'Kids', description: 'Kids fashion - boys & girls collection', image: { url: '/images/product3.png', public_id: 'cat_kids' }, parent: '6a9b8882c4a92a5ddf7d5efe' },
  { _id: '6a9b8882c4a92a5ddf7d5f13', name: 'Mens Accessories', description: 'Watches, belts, wallets for men', image: { url: '/images/product1.png', public_id: 'cat_mens_acc' }, parent: '6a9b8882c4a92a5ddf7d5efe' },
  { _id: '6a9b8882c4a92a5ddf7d5f14', name: 'Womens Accessories', description: 'Bags, jewellery, scarves for women', image: { url: '/images/product3.png', public_id: 'cat_womens_acc' }, parent: '6a9b8882c4a92a5ddf7d5efe' },
  { _id: '6a9b8882c4a92a5ddf7d5f15', name: 'Mens Upper Wear', description: 'Shirts, t-shirts, kurtas for men', image: { url: '/images/product2.png', public_id: 'cat_mens_upper' }, parent: '6a9b8882c4a92a5ddf7d5efe' },
  { _id: '6a9b8882c4a92a5ddf7d5f16', name: 'Mens Bottom Wear', description: 'Jeans, trousers, shorts for men', image: { url: '/images/product2.png', public_id: 'cat_mens_bottom' }, parent: '6a9b8882c4a92a5ddf7d5efe' },
  { _id: '6a9b8882c4a92a5ddf7d5f17', name: 'Womens Upper Wear', description: 'Tops, kurtis, shirts for women', image: { url: '/images/product2.png', public_id: 'cat_womens_upper' }, parent: '6a9b8882c4a92a5ddf7d5efe' },
  { _id: '6a9b8882c4a92a5ddf7d5f18', name: 'Womens Bottom Wear', description: 'Jeans, palazzos, leggings for women', image: { url: '/images/product3.png', public_id: 'cat_womens_bottom' }, parent: '6a9b8882c4a92a5ddf7d5efe' },
];

const products = [
  {
    _id: '6a9b8883c4a92a5ddf7d5f05',
    name: 'Premium Wireless Headphones',
    description: 'Immersive sound with noise cancellation technology. 20 hours battery life.',
    price: 199.99,
    category: categories[0],
    stock: 50,
    ratings: 4.8,
    numOfReviews: 12,
    images: [{ url: '/images/product1.png', public_id: 'p1' }],
    createdAt: new Date().toISOString(),
  },
  {
    _id: '6a9b8883c4a92a5ddf7d5f06',
    name: 'Luxury Classic Watch',
    description: 'Stainless steel body with genuine leather strap. Water resistant.',
    price: 299.99,
    category: categories[1],
    stock: 30,
    ratings: 4.9,
    numOfReviews: 8,
    images: [{ url: '/images/product2.png', public_id: 'p2' }],
    createdAt: new Date().toISOString(),
  },
  {
    _id: '6a9b8883c4a92a5ddf7d5f07',
    name: 'Premium Leather Backpack',
    description: 'Spacious and stylish backpack made from 100% genuine leather.',
    price: 149.99,
    category: categories[1],
    stock: 25,
    ratings: 4.7,
    numOfReviews: 15,
    images: [{ url: '/images/product3.png', public_id: 'p3' }],
    createdAt: new Date().toISOString(),
  },
  {
    _id: '6a9b8883c4a92a5ddf7d5f08',
    name: 'Smart Home Speaker',
    description: 'Voice-controlled speaker with premium sound and smart assistant integration.',
    price: 129.99,
    category: categories[0],
    stock: 40,
    ratings: 4.5,
    numOfReviews: 20,
    images: [{ url: '/images/product1.png', public_id: 'p4' }],
    createdAt: new Date().toISOString(),
  },
];

module.exports = { categories, products };
