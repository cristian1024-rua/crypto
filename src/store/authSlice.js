import { createSlice } from 'https://cdn.skypack.dev/@reduxjs/toolkit';

const slice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null, status: 'idle' },
  reducers: {
    setLoginSuccess: (s, a) => { s.token = a.payload.token; s.status = 'succeeded'; },
    logout: s => { s.user = null; s.token = null; s.status = 'idle'; },
  },
});

export const authSlice = slice.actions;
export default slice.reducer;