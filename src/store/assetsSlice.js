import { createSlice } from 'https://cdn.skypack.dev/@reduxjs/toolkit';

const slice = createSlice({
  name: 'assets',
  initialState: { assets: {} },
  reducers: { setAssets: (s, a) => a.payload.forEach(item => s.assets[item.id] = item), },
});

export const assetsSlice = slice.actions;
export default slice.reducer;