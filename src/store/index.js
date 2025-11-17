import { configureStore } from 'https://cdn.skypack.dev/@reduxjs/toolkit';
import authReducer from './authSlice.js';
import assetsReducer from './assetsSlice.js';
import marketReducer from './marketSlice.js';
import watchlistReducer from './watchlistSlice.js';
import uiReducer from './uiSlice.js';
import walletReducer from './walletSlice.js';
import ordersReducer from './ordersSlice.js';

export default configureStore({
  reducer: {
    auth: authReducer,
    assets: assetsReducer,
    market: marketReducer,
    watchlist: watchlistReducer,
    ui: uiReducer,
    wallet: walletReducer,
    orders: ordersReducer,
  },
});