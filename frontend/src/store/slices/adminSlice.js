import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Récupérer tous les utilisateurs
export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        return rejectWithValue(detail.map(err => err.msg).join(', '));
      }
      return rejectWithValue(detail || 'Erreur lors de la récupération des utilisateurs');
    }
  }
);

// Modifier le rôle d'un utilisateur
export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, newRole }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/users/${userId}/role?new_role=${newRole}`);
      return { userId, newRole, message: response.data.message };
    } catch (error) {
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        return rejectWithValue(detail.map(err => err.msg).join(', '));
      }
      return rejectWithValue(detail || 'Erreur lors de la modification du rôle');
    }
  }
);

// Supprimer un utilisateur
export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      return userId;
    } catch (error) {
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        return rejectWithValue(detail.map(err => err.msg).join(', '));
      }
      return rejectWithValue(detail || "Erreur lors de la suppression de l'utilisateur");
    }
  }
);

const initialState = {
  users: [],
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update user role
      .addCase(updateUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.loading = false;
        const { userId, newRole } = action.payload;
        const userIndex = state.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          state.users[userIndex].role = newRole;
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(u => u.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
