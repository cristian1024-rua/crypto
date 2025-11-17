self.onmessage = async e => {
  const q = e.data;
  const r = await fetch(`https://api.coincap.io/v2/assets?search=${encodeURIComponent(q)}`);
  self.postMessage((await r.json()).data);
};