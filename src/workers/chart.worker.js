const candles = [];
let curr = null;
self.onmessage = e => {
  const { price, time } = e.data;
  const minute = Math.floor(time / 60_000) * 60_000;
  if (!curr || curr.t !== minute) {
    if (curr) candles.push(curr);
    curr = { t: minute, o: price, h: price, l: price, c: price, v: 0 };
  }
  curr.h = Math.max(curr.h, price);
  curr.l = Math.min(curr.l, price);
  curr.c = price;
  curr.v += 1;
  self.postMessage(candles.slice(-60));
};