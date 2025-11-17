import { createSlice } from 'https://cdn.skypack.dev/@reduxjs/toolkit';

const slice = createSlice({
  name: 'watchlist',
  initialState: { items: {} },
  reducers: { setWatchlist: (s, a) => a.payload.forEach(id => s.items[id] = { notes: '' }), },
});

export const watchlistSlice = slice.actions;
export default slice.reducer;