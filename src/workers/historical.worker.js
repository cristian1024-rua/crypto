self.onmessage = async e => {
  const id = e.data;
  const r = await fetch(`https://api.coincap.io/v2/assets/${id}/history?interval=d1`);
  const data = (await r.json()).data;
  const prices = data.map(d => parseFloat(d.priceUsd));
  const max = Math.max(...prices);
  const min = Math.min(...prices);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  self.postMessage({ id, max, min, avg });
};