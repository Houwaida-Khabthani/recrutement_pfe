import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchCandidateProfile = createAsyncThunk(
  'candidate/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/candidates/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCandidateProfile = createAsyncThunk(
  'candidate/updateProfile',
  async (profileData: any, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/candidates/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCandidateStats = createAsyncThunk(
  'candidate/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/candidates/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const candidateSlice = createSlice({
  name: 'candidate',
  initialState: {
    profile: null,
    stats: null,
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCandidateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchCandidateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateCandidateProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(fetchCandidateStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export default candidateSlice.reducer;
