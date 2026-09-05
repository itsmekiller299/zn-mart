import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currency: localStorage.getItem('currency') || 'USD',
  exchangeRate: 83.5, // 1 USD = 83.5 INR (example)
};

export const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setCurrency: (state, action) => {
      state.currency = action.payload;
      localStorage.setItem('currency', action.payload);
    },
  },
});

export const { setCurrency } = currencySlice.actions;
export default currencySlice.reducer;
