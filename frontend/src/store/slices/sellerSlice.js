import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Soumettre une demande vendeur
export const submitSellerRequest = createAsyncThunk(
  'seller/submitRequest',
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await api.post('/seller/request', requestData);
      return response.data;
    } catch (error) {
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        return rejectWithValue(detail.map(err => err.msg).join(', '));
      }
      return rejectWithValue(detail || 'Erreur lors de la soumission de la demande');
    }
  }
);

// Récupérer le statut de la demande
export const fetchSellerRequestStatus = createAsyncThunk(
  'seller/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/seller/request/status');
      return response.data;
    } catch (error) {
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        return rejectWithValue(detail.map(err => err.msg).join(', '));
      }
      return rejectWithValue(detail || 'Erreur lors de la récupération du statut');
    }
  }
);

// Admin: Récupérer les demandes en attente
export const fetchPendingRequests = createAsyncThunk(
  'seller/fetchPendingRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/seller-requests');
      return response.data;
    } catch (error) {
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        return rejectWithValue(detail.map(err => err.msg).join(', '));
      }
      return rejectWithValue(detail || 'Erreur lors de la récupération des demandes');
    }
  }
);

// Admin: Approuver ou refuser une demande
export const processSellerRequest = createAsyncThunk(
  'seller/processRequest',
  async ({ userId, action, rejectionReason }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/seller-requests/${userId}`, {
        action,
        rejection_reason: rejectionReason
      });
      return { userId, action, message: response.data.message };
    } catch (error) {
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        return rejectWithValue(detail.map(err => err.msg).join(', '));
      }
      return rejectWithValue(detail || 'Erreur lors du traitement de la demande');
    }
  }
);

const initialState = {
  status: 'none', // none, pending, approved, rejected
  request: null,
  pendingRequests: [],
  loading: false,
  error: null,
  successMessage: null,
};

const sellerSlice = createSlice({
  name: 'seller',
  initialState,
  reducers: {
    clearSellerError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit request
      .addCase(submitSellerRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitSellerRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'pending';
        state.successMessage = action.payload.message;
      })
      .addCase(submitSellerRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch status
      .addCase(fetchSellerRequestStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerRequestStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.status = action.payload.status;
        state.request = action.payload.request;
      })
      .addCase(fetchSellerRequestStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch pending requests (admin)
      .addCase(fetchPendingRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingRequests = action.payload;
      })
      .addCase(fetchPendingRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Process request (admin)
      .addCase(processSellerRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processSellerRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingRequests = state.pendingRequests.filter(
          req => req.id !== action.payload.userId
        );
        state.successMessage = action.payload.message;
      })
      .addCase(processSellerRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSellerError, clearSuccessMessage } = sellerSlice.actions;
export default sellerSlice.reducer;
