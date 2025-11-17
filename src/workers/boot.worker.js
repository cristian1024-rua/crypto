self.onmessage = async () => {
  try {
    // Usamos CoinGecko (no requiere API key y suele permitir CORS)
    const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=250&page=1');
    if (!res.ok) {
      // No lanzamos excepción para evitar "Uncaught (in promise)"
      console.warn('boot.worker: CoinGecko markets request failed', res.status);
      self.postMessage([]); // mantenemos la forma: array (como antes)
      return;
    }
    const json = await res.json();
    // Mapear a una forma similar a la usada en el resto del app
    const data = json.map(a => ({
      id: a.id,
      priceUsd: String(a.current_price),
      name: a.name,
      symbol: a.symbol,
    }));
    self.postMessage(data);
  } catch (err) {
    console.warn('boot.worker fetch error:', err);
    // No enviamos objeto roto; enviamos array vacío para que el frontend no rompa
    self.postMessage([]);
  }
};