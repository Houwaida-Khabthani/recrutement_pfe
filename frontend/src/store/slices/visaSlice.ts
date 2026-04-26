import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchVisaStatus = createAsyncThunk(
  'visa/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/visas/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch visa status');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchVisaHistory = createAsyncThunk(
  'visa/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/visas/history`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch visa history');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const visaSlice = createSlice({
  name: 'visa',
  initialState: {
    status: null,
    history: [],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVisaStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVisaStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.status = action.payload;
      })
      .addCase(fetchVisaStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchVisaHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      });
  },
});

export default visaSlice.reducer;
