// Este worker puede recibir al iniciarse un mensaje con:
// { watchlist: ['bitcoin','ethereum'], interval: 5000 }
// Si recibe watchlist, solo pedirá esos ids a CoinGecko (mejor para rate limits).
let timer = null;
let currentWatchlist = null;
let currentInterval = 5000;

self.onmessage = (e) => {
  try {
    const data = e && e.data ? e.data : {};
    if (data.watchlist && Array.isArray(data.watchlist)) {
      currentWatchlist = data.watchlist.slice(0, 250); // limitar por seguridad
    }
    if (data.interval && typeof data.interval === 'number') {
      currentInterval = data.interval;
    }
    // si ya existe timer lo limpiamos para reconfigurar
    if (timer) clearInterval(timer);

    timer = setInterval(async () => {
      try {
        if (currentWatchlist && currentWatchlist.length) {
          // pedir precios solo de los ids solicitados
          const ids = currentWatchlist.join(',');
          const r = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(ids)}`);
          if (!r.ok) {
            console.warn('marketPoll worker: CoinGecko markets failed', r.status);
            return;
          }
          const j = await r.json();
          self.postMessage(j.map(a => ({ id: a.id, priceUsd: String(a.current_price) })));
        } else {
          // fallback: pedir una página general de mercados (limitar per_page)
          const r = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=250&page=1');
          if (!r.ok) {
            console.warn('marketPoll worker general fetch failed', r.status);
            return;
          }
          const j = await r.json();
          self.postMessage(j.map(a => ({ id: a.id, priceUsd: String(a.current_price) })));
        }
      } catch (err) {
        console.warn('marketPoll worker fetch error:', err);
      }
    }, currentInterval);
  } catch (err) {
    console.warn('marketPoll worker onmessage error:', err);
  }
};