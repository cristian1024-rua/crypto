export { BestPerformerStrategy } from './BestPerformerStrategy.js';
export class RSIStrategy {
  analyze(watchlist, marketData) {
    const prices = Object.values(marketData).map(p => parseFloat(p));
    const gains = [], losses = [];
    for (let i = 1; i < prices.length; i++) {
      const d = prices[i] - prices[i - 1];
      gains.push(d > 0 ? d : 0);
      losses.push(d < 0 ? -d : 0);
    }
    const avgGain = gains.slice(-14).reduce((a, b) => a + b, 0) / 14;
    const avgLoss = losses.slice(-14).reduce((a, b) => a + b, 0) / 14;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);
    return { strategy: 'RSI', rsi: rsi.toFixed(2) };
  }
}