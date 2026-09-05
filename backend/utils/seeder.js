const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');

const seedData = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount > 0) {
      console.log('Database already has data. Skipping automatic seeding.');
      return;
    }

    console.log('Database is empty. Starting automatic seeding...');

    // Seed Categories
    const categories = await Category.create([
      { name: 'Electronics', description: 'Gadgets and gizmos', image: { url: '/images/product1.png', public_id: 'cat1' } },
      { name: 'Fashion', description: 'Trendy apparel', image: { url: '/images/product2.png', public_id: 'cat2' } },
      { name: 'Home & Garden', description: 'Everything for your home', image: { url: '/images/product3.png', public_id: 'cat3' } }
    ]);

    // Seed Admin User
    await User.create({
      name: 'Admin User',
      email: 'admin@znmart.com',
      password: 'password123',
      role: 'admin'
    });

    // Seed Products
    await Product.create([
      {
        name: 'Premium Wireless Headphones',
        description: 'Immersive sound with noise cancellation technology. 20 hours battery life.',
        price: 199.99,
        category: categories[0]._id,
        stock: 50,
        ratings: 4.8,
        images: [{ url: '/images/product1.png', public_id: 'p1' }]
      },
      {
        name: 'Luxury Classic Watch',
        description: 'Stainless steel body with genuine leather strap. Water resistant.',
        price: 299.99,
        category: categories[1]._id,
        stock: 30,
        ratings: 4.9,
        images: [{ url: '/images/product2.png', public_id: 'p2' }]
      },
      {
        name: 'Premium Leather Backpack',
        description: 'Spacious and stylish backpack made from 100% genuine leather.',
        price: 149.99,
        category: categories[1]._id,
        stock: 25,
        ratings: 4.7,
        images: [{ url: '/images/product3.png', public_id: 'p3' }]
      },
      {
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
