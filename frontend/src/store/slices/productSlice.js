import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Récupérer les produits du vendeur
export const fetchSellerProducts = createAsyncThunk(
  'products/fetchSellerProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/seller/products');
      return response.data;
    } catch (error) {
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        return rejectWithValue(detail.map(err => err.msg).join(', '));
      }
      return rejectWithValue(detail || 'Erreur lors de la récupération des produits');
    }
  }
);

// Créer un produit
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await api.post('/products/', productData);
      return response.data;
    } catch (error) {
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        return rejectWithValue(detail.map(err => err.msg).join(', '));
      }
      return rejectWithValue(detail || 'Erreur lors de la création du produit');
    }
  }
);

// Mettre à jour un produit
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/seller/products/${productId}`, productData);
      return response.data;
    } catch (error) {
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        return rejectWithValue(detail.map(err => err.msg).join(', '));
      }
      return rejectWithValue(detail || 'Erreur lors de la mise à jour du produit');
    }
  }
);

// Supprimer un produit
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      await api.delete(`/seller/products/${productId}`);
      return productId;
    } catch (error) {
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        return rejectWithValue(detail.map(err => err.msg).join(', '));
      }
      return rejectWithValue(detail || 'Erreur lors de la suppression du produit');
    }
  }
);

// Récupérer la boutique du vendeur
export const fetchMyShop = createAsyncThunk(
  'products/fetchMyShop',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/shops/me');
      return response.data;
    } catch (error) {
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        return rejectWithValue(detail.map(err => err.msg).join(', '));
      }
      return rejectWithValue(detail || 'Erreur lors de la récupération de la boutique');
    }
  }
);

const initialState = {
  products: [],
  myShop: null,
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch seller products
      .addCase(fetchSellerProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchSellerProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(p => p.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch my shop
      .addCase(fetchMyShop.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyShop.fulfilled, (state, action) => {
        state.loading = false;
        state.myShop = action.payload;
      })
      .addCase(fetchMyShop.rejected, (state, action) => {
        state.loading = false;
        state.myShop = null;
      });
  },
});

export const { clearProductError } = productSlice.actions;
export default productSlice.reducer;
