import { createSlice } from 'https://cdn.skypack.dev/@reduxjs/toolkit';

const slice = createSlice({
  name: 'market',
  initialState: { prices: {} },
  reducers: {
    setPrice: (s, a) => { s.prices[a.payload.id] = a.payload.priceUsd; },
    setInitialPrices: (s, a) => a.payload.forEach(p => s.prices[p.id] = p.priceUsd),
  },
});

export const marketSlice = slice.actions;
export default slice.reducer;