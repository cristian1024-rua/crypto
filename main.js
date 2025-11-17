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

async function onLogin(email, password) {
  console.log('6️⃣ onLogin llamado con:', email, password);
  try {
    const loginData = await apiService.login(email, password);
    console.log('7️⃣ Login OK → dispatching token', loginData);
    store.dispatch({ type: 'auth/setLoginSuccess', payload: loginData });

    // Obtener user (reqres) y luego posts (jsonplaceholder)
    const userId = 5;
    const user = await apiService.get(`https://reqres.in/api/users/${userId}`);
    if (!user || !user.data) {
      console.warn('⚠️ Usuario no encontrado en reqres:', user);
    }

    const postsResp = await apiService.get(`https://jsonplaceholder.typicode.com/users/${user?.data?.id ?? userId}/posts`);
    const posts = Array.isArray(postsResp) ? postsResp : postsResp?.data ?? [];
    if (!posts.length) {
      console.warn('⚠️ No se obtuvieron posts para el usuario:', postsResp);
    }

    // Derivar lista inicial desde títulos (frágil): mantener pero con validación
    const list = posts
      .map(p => (p.title || '').split(' ')[0].toLowerCase())
      .filter(Boolean)
      .slice(0, 10); // limitar número para no saturar API

    // Si no generó ningún término válido, usar watchlist por defecto
    const finalList = list.length ? list : ['bitcoin', 'ethereum', 'tether', 'usd-coin'];

    store.dispatch(watchlistSlice.actions.setWatchlist(finalList));

    // Función que obtiene precios desde CoinGecko (sin API key)
    async function fetchPricesFromCoinGecko(terms) {
      const normalized = terms.map(t => String(t).toLowerCase().trim()).filter(Boolean);
      const prices = [];

      if (!normalized.length) return prices;

      // Intento agrupado: pedir mercados por ids directos
      try {
        const idsParam = normalized.join(',');
        const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(idsParam)}`);
        if (res.ok) {
          const data = await res.json();
          data.forEach(d => prices.push({ id: d.id, priceUsd: String(d.current_price) }));
        } else {
          console.warn('CoinGecko markets request failed:', res.status);
        }
      } catch (err) {
        console.warn('Error petición CoinGecko markets directa:', err);
      }

      // Determine qué términos siguen sin precio (no devueltos)
      const foundIds = new Set(prices.map(p => p.id));
      const missing = normalized.filter(t => !foundIds.has(t));

      // Para cada missing, usar /search para obtener un id candidato y pedir su precio
      for (const m of missing) {
        try {
          const resp = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(m)}`);
          if (!resp.ok) continue;
          const j = await resp.json();
          if (j && Array.isArray(j.coins) && j.coins.length) {
            const candidateId = j.coins[0].id;
            const r2 = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(candidateId)}`);
            if (!r2.ok) continue;
            const arr = await r2.json();
            if (Array.isArray(arr) && arr[0]) {
              prices.push({ id: arr[0].id, priceUsd: String(arr[0].current_price) });
            }
          }
        } catch (err) {
          console.warn('Error búsqueda CoinGecko para', m, err);
        }
      }

      return prices;
    }

    // Obtener precios (limitado)
    const prices = await fetchPricesFromCoinGecko(finalList.slice(0, 10));
    if (!prices || !prices.length) {
      console.warn('⚠️ No se obtuvieron precios válidos desde CoinGecko, revisa los términos:', finalList);
      facade.startBootLoad();
      return;
    }

    const mapped = prices.map(p => ({ id: p.id, priceUsd: p.priceUsd }));
    store.dispatch(marketSlice.actions.setInitialPrices(mapped));
    facade.startBootLoad();
    facade.startMarketFeed();
    console.log('✅ Bootload y market feed iniciados con precios:', mapped);
  } catch (err) {
    console.error('❌ Error en onLogin:', err);
  }
}