import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

const loadCompare = () => {
  try {
    return JSON.parse(localStorage.getItem('compare') || '[]');
  } catch {
    return [];
  }
};

const saveCompare = (items) => {
  localStorage.setItem('compare', JSON.stringify(items));
};

const initialState = {
  items: loadCompare(),
};

export const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    addToCompare: (state, action) => {
      if (state.items.find((i) => i._id === action.payload._id)) return;
      if (state.items.length >= 4) return;
      state.items.push(action.payload);
      saveCompare(state.items);
    },
    removeFromCompare: (state, action) => {
      state.items = state.items.filter((i) => i._id !== action.payload);
      saveCompare(state.items);
    },
    clearCompare: (state) => {
      state.items = [];
      saveCompare(state.items);
    },
  },
});

export const { addToCompare, removeFromCompare, clearCompare } = compareSlice.actions;
export default compareSlice.reducer;
