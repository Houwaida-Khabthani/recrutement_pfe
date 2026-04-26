import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import jobReducer from "./slices/jobSlice";
import candidateReducer from "./slices/candidateSlice";
import companyReducer from "./slices/companySlice";
import applicationReducer from "./slices/applicationSlice";
import visaReducer from "./slices/visaSlice";
import notificationReducer from "./slices/notificationSlice";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    jobs: jobReducer,
    candidate: candidateReducer,
    company: companyReducer,
    applications: applicationReducer,
    visa: visaReducer,
    notifications: notificationReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;