import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const getReviews = createAsyncThunk('reviews/getAll', async (productId, thunkAPI) => {
  try {
    const res = await axios.get(`/api/products/${productId}/reviews`);
    return res.data.data;
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const addReview = createAsyncThunk('reviews/add', async ({ productId, rating, comment }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const res = await axios.post(`/api/products/${productId}/reviews`, { rating, comment }, config);
    return res.data.data;
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

const initialState = {
  reviews: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

export const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getReviews.pending, (state) => { state.isLoading = true; })
      .addCase(getReviews.fulfilled, (state, action) => { state.isLoading = false; state.reviews = action.payload; })
      .addCase(getReviews.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; })
      .addCase(addReview.pending, (state) => { state.isLoading = true; })
      .addCase(addReview.fulfilled, (state, action) => { state.isLoading = false; state.isSuccess = true; state.reviews.push(action.payload); })
      .addCase(addReview.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; });
  },
});

export const { reset } = reviewSlice.actions;
export default reviewSlice.reducer;
