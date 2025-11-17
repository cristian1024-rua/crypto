import strategies from '../patterns/strategy/index.js';
self.onmessage = e => {
  const { strategy, watchlist, marketData } = e.data;
  const StrategyClass = strategies[strategy];
  self.postMessage(new StrategyClass().analyze(watchlist, marketData));
};