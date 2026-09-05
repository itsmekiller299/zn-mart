import { createSlice } from '@reduxjs/toolkit';

const COUPONS = {
  SAVE10: 10,
  WELCOME20: 20,
  FESTIVE25: 25,
  ZNMART15: 15,
};

const initialState = {
  appliedCoupon: null,
  discountPercent: 0,
  error: null,
};

export const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    applyCoupon: (state, action) => {
      const code = action.payload?.toUpperCase().trim();
      if (COUPONS[code]) {
        state.appliedCoupon = code;
        state.discountPercent = COUPONS[code];
        state.error = null;
      } else {
        state.error = 'Invalid coupon code';
      }
    },
    removeCoupon: (state) => {
      state.appliedCoupon = null;
      state.discountPercent = 0;
      state.error = null;
    },
    clearError: (state) => { state.error = null; },
  },
});

export const { applyCoupon, removeCoupon, clearError } = couponSlice.actions;
export const availableCoupons = COUPONS;
export default couponSlice.reducer;
