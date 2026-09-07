const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const mongoose = require('mongoose');

// Fixed IDs so tokens stay valid after in-memory DB restart (prevents "User no longer exists")
const FIXED_IDS = {
  admin: new mongoose.Types.ObjectId('000000000000000000000001'),
  categories: [
    new mongoose.Types.ObjectId('000000000000000000000011'), // Electronics
    new mongoose.Types.ObjectId('000000000000000000000012'), // Fashion
    new mongoose.Types.ObjectId('000000000000000000000013'), // Home & Garden
    new mongoose.Types.ObjectId('000000000000000000000014'), // Mens
    new mongoose.Types.ObjectId('000000000000000000000015'), // Womens
    new mongoose.Types.ObjectId('000000000000000000000016'), // Kids
    new mongoose.Types.ObjectId('000000000000000000000017'), // Mens Accessories
    new mongoose.Types.ObjectId('000000000000000000000018'), // Womens Accessories
  ],
  products: [
    new mongoose.Types.ObjectId('000000000000000000000101'),
    new mongoose.Types.ObjectId('000000000000000000000102'),
    new mongoose.Types.ObjectId('000000000000000000000103'),
    new mongoose.Types.ObjectId('000000000000000000000104'),
  ],
};

const seedData = async () => {
  try {
    // Ensure all 8 categories exist (Fashion expanded to Mens/Womens/Kids + Accessories)
    const catCount = await Category.countDocuments();
    let categories;
    if (catCount === 0) {
      console.log('Database is empty. Starting automatic seeding...');
      categories = await Category.create([
        { _id: FIXED_IDS.categories[0], name: 'Electronics', description: 'Gadgets and gizmos', image: { url: '/images/product1.png', public_id: 'cat1' } },
        { _id: FIXED_IDS.categories[1], name: 'Fashion', description: 'Trendy apparel', image: { url: '/images/product2.png', public_id: 'cat2' } },
        { _id: FIXED_IDS.categories[2], name: 'Home & Garden', description: 'Everything for your home', image: { url: '/images/product3.png', public_id: 'cat3' } },
        { _id: FIXED_IDS.categories[3], name: 'Mens', description: 'Mens fashion - shirts, pants, t-shirts', image: { url: '/images/product2.png', public_id: 'cat_mens' } },
        { _id: FIXED_IDS.categories[4], name: 'Womens', description: 'Womens fashion - dresses, tops, sarees', image: { url: '/images/product2.png', public_id: 'cat_womens' } },
        { _id: FIXED_IDS.categories[5], name: 'Kids', description: 'Kids fashion - boys & girls collection', image: { url: '/images/product3.png', public_id: 'cat_kids' } },
        { _id: FIXED_IDS.categories[6], name: 'Mens Accessories', description: 'Watches, belts, wallets for men', image: { url: '/images/product1.png', public_id: 'cat_mens_acc' } },
        { _id: FIXED_IDS.categories[7], name: 'Womens Accessories', description: 'Bags, jewellery, scarves for women', image: { url: '/images/product3.png', public_id: 'cat_womens_acc' } }
      ]);
    } else {
      // Add missing new categories if DB has old 3-category data
      const names = ['Electronics','Fashion','Home & Garden','Mens','Womens','Kids','Mens Accessories','Womens Accessories'];
      const descs = ['Gadgets and gizmos','Trendy apparel','Everything for your home','Mens fashion - shirts, pants, t-shirts','Womens fashion - dresses, tops, sarees','Kids fashion - boys & girls collection','Watches, belts, wallets for men','Bags, jewellery, scarves for women'];
      for (let i = 0; i < FIXED_IDS.categories.length; i++) {
        const exists = await Category.findById(FIXED_IDS.categories[i]);
        if (!exists) {
          await Category.create({ _id: FIXED_IDS.categories[i], name: names[i], description: descs[i], image: { url: `/images/product${(i%3)+1}.png`, public_id: `cat_${i}` } });
          console.log(`Added missing category: ${names[i]}`);
        }
      }
      categories = await Category.find();
    }

    const productCount = await Product.countDocuments();
    if (productCount > 0) {
      console.log('Database already has products. Skipping product seeding.');
      return;
    }

    console.log('Seeding products...');

    // Seed Admin User with fixed ID
    await User.create({
      _id: FIXED_IDS.admin,
      name: 'Admin User',
      email: 'admin@znmart.com',
      password: 'password123',
      role: 'admin'
    });

    // Seed Products with fixed IDs
    await Product.create([
      {
        _id: FIXED_IDS.products[0],
        name: 'Premium Wireless Headphones',
        description: 'Immersive sound with noise cancellation technology. 20 hours battery life.',
        price: 199.99,
        category: categories[0]._id,
        stock: 50,
        ratings: 4.8,
        images: [{ url: '/images/product1.png', public_id: 'p1' }]
      },
      {
        _id: FIXED_IDS.products[1],
        name: 'Luxury Classic Watch',
        description: 'Stainless steel body with genuine leather strap. Water resistant.',
        price: 299.99,
        category: categories[1]._id,
        stock: 30,
        ratings: 4.9,
        images: [{ url: '/images/product2.png', public_id: 'p2' }]
      },
      {
        _id: FIXED_IDS.products[2],
        name: 'Premium Leather Backpack',
        description: 'Spacious and stylish backpack made from 100% genuine leather.',
        price: 149.99,
        category: categories[1]._id,
        stock: 25,
        ratings: 4.7,
        images: [{ url: '/images/product3.png', public_id: 'p3' }]
      },
      {
        _id: FIXED_IDS.products[3],
        name: 'Smart Home Speaker',
        description: 'Voice-controlled speaker with premium sound and smart assistant integration.',
        price: 129.99,
        category: categories[0]._id,
        stock: 40,
        ratings: 4.5,
        images: [{ url: '/images/product1.png', public_id: 'p4' }]
      }
    ]);

    console.log('Automatic seeding completed successfully!');
  } catch (err) {
    console.error('Error during automatic seeding:', err);
  }
};

module.exports = seedData;
