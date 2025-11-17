import { createSlice } from 'https://cdn.skypack.dev/@reduxjs/toolkit';

const slice = createSlice({
  name: 'orders',
  initialState: [],
  reducers: {
    addOrder: (s, a) => { s.push({ ...a.payload, id: crypto.randomUUID() }); },
  },
});

export const ordersSlice = slice.actions;
export default slice.reducer;