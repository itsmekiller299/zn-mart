const fs = require('fs');
const path = require('path');

const STORE_PATH = '/tmp/znmart_mock_orders.json';

// Ensure global store exists
global.mockOrdersStore = global.mockOrdersStore || [];

const load = () => {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = fs.readFileSync(STORE_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        global.mockOrdersStore = parsed;
        return parsed;
      }
    }
  } catch (e) { /* ignore */ }
  return global.mockOrdersStore;
};

const save = (orders) => {
  global.mockOrdersStore = orders;
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(orders), 'utf8');
  } catch (e) { /* ignore - /tmp may not exist in some env */ }
};

const getAll = () => {
  const fromFile = load();
  // Merge in-memory and file, deduplicate by _id
  const combined = [...global.mockOrdersStore, ...fromFile];
  const map = new Map();
  combined.forEach(o => map.set(String(o._id), o));
  const result = Array.from(map.values());
  // Also merge with orderController's in-memory for backward compat
  try {
    const { mockData } = require('../controllers/orderController');
    if (mockData && Array.isArray(mockData.orders)) {
      mockData.orders.forEach(o => {
        if (!map.has(String(o._id))) {
          map.set(String(o._id), o);
          result.push(o);
        }
      });
    }
  } catch (e) {}
  return result;
};

const add = (order) => {
  const all = getAll();
  all.push(order);
  save(all);
  // Also push to orderController's mockData for same-container fast path
  try {
    const { mockData } = require('../controllers/orderController');
    if (mockData && Array.isArray(mockData.orders)) {
      if (!mockData.orders.find(o => String(o._id) === String(order._id))) {
        mockData.orders.push(order);
      }
    }
  } catch (e) {}
  global.mockOrdersStore = all;
};

module.exports = { getAll, add, load, save };