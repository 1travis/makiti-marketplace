// src/store/slices/shopSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const createShop = createAsyncThunk(
  'shops/createShop',
  async (shopData, { rejectWithValue }) => {
    try {
      const response = await api.post('/shops/', shopData);
      return response.data;
    } catch (error) {
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        return rejectWithValue(detail.map(err => err.msg).join(', '));
      }
      return rejectWithValue(detail || 'Erreur lors de la création de la boutique');
    }
  }
);

const shopSlice = createSlice({
  name: 'shops',
  initialState: {
    loading: false,
    error: null,
    currentShop: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createShop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createShop.fulfilled, (state, action) => {
        state.loading = false;
        state.currentShop = action.payload;
      })
      .addCase(createShop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default shopSlice.reducer;