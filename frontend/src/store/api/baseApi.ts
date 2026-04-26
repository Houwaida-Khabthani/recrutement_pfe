import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    prepareHeaders: (headers, { getState }) => {
      let token = (getState() as any).auth?.token;
      if (!token) {
        token = localStorage.getItem('token');
      }
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
        console.log('[API] Sending Authorization header ✅');
      } else {
        console.log('[API] ⚠️ No token found - Request will be unauthorized');
      }
      return headers;
    },
  }),
  tagTypes: ['Profile', 'Applications', 'Jobs', 'Visa', 'Stats', 'Interviews'],
  endpoints: () => ({}),
});
