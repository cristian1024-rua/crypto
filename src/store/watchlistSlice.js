import { createSlice } from 'https://cdn.skypack.dev/@reduxjs/toolkit';

const slice = createSlice({
  name: 'watchlist',
  initialState: { items: {} },
  reducers: {
    setWatchlist: (s, a) => {
      // reiniciar el objeto para evitar referencias previas
      s.items = {};
      a.payload.forEach(id => {
        if (id) s.items[id] = { notes: '' };
      });
    },
  },
});

export const watchlistSlice = slice; // exportamos el slice completo (para usar .actions)
export default slice.reducer;