self.onmessage = async () => {
  const r = await fetch('https://api.coincap.io/v2/assets');
  const j = await r.json();
  self.postMessage(j.data);
};