import { createSlice } from 'https://cdn.skypack.dev/@reduxjs/toolkit';

const slice = createSlice({
  name: 'wallet',
  initialState: { USDT: 10_000, BTC: 0 },
  reducers: {
    updateBalance: (s, a) => {
      const { asset, amount } = a.payload;
      s[asset] = parseFloat((s[asset] + amount).toFixed(8));
    },
  },
});

export const walletSlice = slice.actions;
export default slice.reducer;