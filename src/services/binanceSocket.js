class BinanceSocket {
  constructor() {
    this.ws = null;
    this.listeners = [];
    this.connect('btcusdt');
  }
  connect(symbol) {
    if (this.ws) this.ws.close();
    this.ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@trade`);
    this.ws.onmessage = msg => {
      const { p: price, s: symbol, T: time } = JSON.parse(msg.data);
      this.listeners.forEach(fn => fn({ symbol, price: parseFloat(price), time }));
    };
  }
  subscribe(fn) { this.listeners.push(fn); }
}
export default new BinanceSocket();