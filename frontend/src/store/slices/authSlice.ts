import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface AuthState {
  user: any;
  token: string | null;
  loading: boolean;
  isInitialized: boolean;
}

const token = localStorage.getItem('token');
const userStr = localStorage.getItem('user');

const initialState: AuthState = {
  user: userStr ? JSON.parse(userStr) : null,
  token: token, 
  loading: false,
  isInitialized: !!token && !!userStr,
};

// Async Thunk for getting current user
export const fetchUser = createAsyncThunk(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch user');
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isInitialized = true;

      if (token) {
        localStorage.setItem('token', token);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isInitialized = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isInitialized = true;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        // Only logout if we had a token (actual auth failure)
        // If no token, just stay logged out
        if (state.token) {
          state.user = null;
          state.token = null;
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      });
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
