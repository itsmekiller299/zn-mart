import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice';
import productReducer from '../features/products/productSlice';
import categoryReducer from '../features/categories/categorySlice';
import currencyReducer from '../features/currency/currencySlice';
import wishlistReducer from '../features/wishlist/wishlistSlice';
import compareReducer from '../features/compare/compareSlice';
import reviewReducer from '../features/reviews/reviewSlice';
import couponReducer from '../features/coupon/couponSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    product: productReducer,
    category: categoryReducer,
    currency: currencyReducer,
    wishlist: wishlistReducer,
    compare: compareReducer,
    review: reviewReducer,
    coupon: couponReducer,
  },
});
