import { createSlice } from "@reduxjs/toolkit";


const initialState = {
  profile: null,
  dashboard: null,
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    setDashboard: (state, action) => {
      state.dashboard = action.payload;
    },
  },
});

export const { setProfile, setDashboard } = companySlice.actions;
export default companySlice.reducer;