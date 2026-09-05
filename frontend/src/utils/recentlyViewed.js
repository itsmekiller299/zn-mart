export const addToRecentlyViewed = (product) => {
  try {
    const key = 'recentlyViewed';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = list.filter((p) => p._id !== product._id);
    filtered.unshift({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || '',
      category: product.category,
      ratings: product.ratings,
    });
    const sliced = filtered.slice(0, 8);
    localStorage.setItem(key, JSON.stringify(sliced));
  } catch {}
};

export const getRecentlyViewed = () => {
  try {
    return JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
  } catch {
    return [];
  }
};

export const clearRecentlyViewed = () => localStorage.removeItem('recentlyViewed');
