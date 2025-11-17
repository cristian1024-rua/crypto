import renderTradingPanel from './renderTradingPanel.js';
import renderChart from './renderChart.js';

export default function renderDashboard(store, facade) {
  const t = document.getElementById('dashboard-template').content.cloneNode(true);
  const search = t.querySelector('#search');
  search.addEventListener('input', e => facade.searchAssets(e.target.value));

  store.subscribe(() => {
    const state = store.getState();
    const wl = t.querySelector('#watchlist');
    wl.innerHTML = '';
    Object.keys(state.watchlist.items).forEach(id => {
      const li = document.createElement('li');
      li.textContent = `${id}: $${parseFloat(state.market.prices[id] || 0).toFixed(2)}`;
      wl.appendChild(li);
    });
    const sr = t.querySelector('#search-results');
    sr.innerHTML = '';
    state.ui.searchResults.forEach(a => {
      const li = document.createElement('li');
      li.textContent = `${a.name} (${a.symbol})`;
      sr.appendChild(li);
    });
  });

  t.querySelector('#trading-placeholder').replaceWith(renderTradingPanel(store, facade));
  t.querySelector('#chart-placeholder').replaceWith(renderChart(store, facade));
  return t;
}