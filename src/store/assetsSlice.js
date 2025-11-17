import { createSlice } from 'https://cdn.skypack.dev/@reduxjs/toolkit';

const slice = createSlice({
  name: 'assets',
  initialState: { assets: {} },
  reducers: {
    setAssets: (s, a) => {
      // defensivo: asegurar estructura y reiniciar para evitar referencias antiguas
      if (!Array.isArray(a.payload)) {
        // si el payload no es un array, no hacemos nada
        return;
      }
      s.assets = {};
      a.payload.forEach(item => {
        if (item && item.id) s.assets[item.id] = item;
      });
    },
    // opcional: agregar otros reducers utiles
    clearAssets: (s) => { s.assets = {}; },
  },
});

export const assetsSlice = slice; // exportamos el slice para usar assetsSlice.actions
export default slice.reducer;