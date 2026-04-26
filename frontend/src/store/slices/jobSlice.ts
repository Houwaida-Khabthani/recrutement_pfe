import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchJobs = createAsyncThunk(
  'jobs/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/jobs`);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRecommendedJobs = createAsyncThunk(
  'jobs/fetchRecommended',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/jobs/recommended`);
      if (!response.ok) throw new Error('Failed to fetch recommended jobs');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createJob = createAsyncThunk(
  'jobs/create',
  async (jobData: any, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(jobData)
      });
      if (!response.ok) throw new Error('Failed to create job');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const jobSlice = createSlice({
  name: 'jobs',
  initialState: {
    items: [],
    recommended: [],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchRecommendedJobs.fulfilled, (state, action) => {
        state.recommended = action.payload;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.items = [action.payload, ...(state.items as any[])];
      });
  },
});

export default jobSlice.reducer;
