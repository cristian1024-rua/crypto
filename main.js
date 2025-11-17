import store from './src/store/index.js';
import { authSlice } from './src/store/authSlice.js';
import { watchlistSlice } from './src/store/watchlistSlice.js';
import { marketSlice } from './src/store/marketSlice.js';
import apiService from './src/services/apiService.js';
import WorkerFacade from './src/services/workerFacade.js';
import renderAuth from './src/ui/renderAuth.js';
import renderDashboard from './src/ui/renderDashboard.js';

const app = document.getElementById('app');
const facade = new WorkerFacade(store);

console.log('1️⃣ main.js ejecutándose');
console.log('2️⃣ Estado inicial auth:', store.getState().auth);

// Forzamos pintado INMEDIATO sin esperar al subscribe
try {
  const state = store.getState();
  if (!state.auth.token) {
    console.log('3️⃣ Pintando formulario FORZADO');
    app.innerHTML = '';
    const authNode = renderAuth(onLogin);
    console.log('4️⃣ Nodo devuelto por renderAuth:', authNode);
    app.appendChild(authNode);
  } else {
    console.log('3️⃣ Pintando dashboard FORZADO');
    app.innerHTML = '';
    app.appendChild(renderDashboard(store, facade));
  }
} catch (err) {
  console.error('❌ Error al pintar:', err);
}

// Subscribe normal (por si el token cambia después)
store.subscribe(() => {
  const state = store.getState();
  console.log('5️⃣ Subscribe disparado → token:', state.auth.token);
  if (!state.auth.token) {
    app.innerHTML = '';
    app.appendChild(renderAuth(onLogin));
  } else {
    app.innerHTML = '';
    app.appendChild(renderDashboard(store, facade));
  }
});

function onLogin(email, password) {
  console.log('6️⃣ onLogin llamado con:', email, password);
  apiService.login(email, password)
    .then(data => {
      console.log('7️⃣ Login OK → dispatching token');
      store.dispatch({ type: 'auth/setLoginSuccess', payload: data });
      const userId = 5;
      return apiService.get(`https://reqres.in/api/users/${userId}`);
    })
    .then(user => apiService.get(`https://jsonplaceholder.typicode.com/users/${user.data.id}/posts`))
    .then(posts => {
      const list = posts.map(p => p.title.split(' ')[0].toLowerCase());
      store.dispatch(watchlistSlice.actions.setWatchlist(list));
      return Promise.all(list.map(id =>
        fetch(`https://api.coincap.io/v2/assets/${id}`).then(r => r.json())
      ));
    })
    .then(prices => {
      const mapped = prices.map(p => ({ id: p.data.id, priceUsd: p.data.priceUsd }));
      store.dispatch(marketSlice.actions.setInitialPrices(mapped));
      facade.startBootLoad();
      facade.startMarketFeed();
    })
    .catch(err => console.error('❌ Error en cadena:', err));
}