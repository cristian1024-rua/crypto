import { assetsSlice } from '../store/assetsSlice.js';
import { marketSlice } from '../store/marketSlice.js';
import { uiSlice } from '../store/uiSlice.js';
import socket from './binanceSocket.js';

export default class WorkerFacade {
  constructor(store) {
    this.store = store;
    this.bootWorker = new Worker('./src/workers/boot.worker.js', { type: 'module' });
    this.marketWorker = new Worker('./src/workers/marketPoll.worker.js', { type: 'module' });
    this.searchWorker = new Worker('./src/workers/search.worker.js', { type: 'module' });
    this.historicalWorker = new Worker('./src/workers/historical.worker.js', { type: 'module' });
    this.analysisWorker = new Worker('./src/workers/analysis.worker.js', { type: 'module' });
    this.chartWorker = new Worker('./src/workers/chart.worker.js', { type: 'module' });

    this.bootWorker.onmessage = e => this.store.dispatch(assetsSlice.actions.setAssets(e.data));
    this.marketWorker.onmessage = e => e.data.forEach(a => this.store.dispatch(marketSlice.actions.setPrice(a)));
    this.searchWorker.onmessage = e => this.store.dispatch(uiSlice.actions.setSearchResults(e.data));
    this.historicalWorker.onmessage = e => this.store.dispatch(uiSlice.actions.setHistoricalSummary(e.data));
    this.analysisWorker.onmessage = e => this.store.dispatch(uiSlice.actions.setAnalysisReport(e.data));

    socket.subscribe(trade => this.sendTrade(trade));
  }

  startBootLoad() { this.bootWorker.postMessage('start'); }
  startMarketFeed() { this.marketWorker.postMessage('start'); }
  searchAssets(q) { this.searchWorker.postMessage(q); }
  getHistoricalSummary(id) { this.historicalWorker.postMessage(id); }
  runAnalysis(strategy, watchlist, marketData) { this.analysisWorker.postMessage({ strategy, watchlist, marketData }); }
  candleSubscribe(cb) { this.chartWorker.onmessage = e => cb(e.data); }
  sendTrade(trade) { this.chartWorker.postMessage(trade); }
}