import { createSlice } from 'https://cdn.skypack.dev/@reduxjs/toolkit';

const slice = createSlice({
  name: 'market',
  initialState: { prices: {} },
  reducers: {
    setPrice: (s, a) => {
      if (!s.prices) s.prices = {};
      if (a && a.payload && a.payload.id) {
        s.prices[a.payload.id] = a.payload.priceUsd;
      }
    },
    setInitialPrices: (s, a) => {
      if (!s.prices) s.prices = {};
      if (Array.isArray(a.payload)) {
        // reiniciamos o actualizamos de forma segura
        a.payload.forEach(p => {
          if (p && p.id) s.prices[p.id] = p.priceUsd;
        });
      }
    },
  },
});

export const marketSlice = slice; // exportamos el slice para usar marketSlice.actions
export default slice.reducer;