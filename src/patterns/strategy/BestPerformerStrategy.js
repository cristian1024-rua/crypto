export class BestPerformerStrategy {
  analyze(watchlist, marketData) {
    const best = Object.keys(watchlist).reduce((best, id) => {
      const price = parseFloat(marketData[id]);
      return !best || price > best.price ? { id, price } : best;
    }, null);
    return { strategy: 'BEST_PERFORMER', best };
  }
}