import renderTradingPanel from './renderTradingPanel.js';
import renderChart from './renderChart.js';

export default function renderDashboard(store, facade) {
  // Usamos un contenedor persistente en lugar de devolver directamente el DocumentFragment.
  // Así las referencias a querySelector dentro del subscribe seguirán funcionando.
  const wrapper = document.createElement('div');
  wrapper.className = 'dashboard-root';

  // Clonamos el template y lo añadimos al wrapper
  const fragment = document.getElementById('dashboard-template').content.cloneNode(true);
  wrapper.appendChild(fragment);

  const search = wrapper.querySelector('#search');
  if (search) {
    search.addEventListener('input', e => facade.searchAssets(e.target.value));
  }

  // Subscribe: actualizamos elementos dentro del wrapper (defensivamente)
  store.subscribe(() => {
    const state = store.getState();

    const wl = wrapper.querySelector('#watchlist');
    if (wl) {
      wl.innerHTML = '';
      Object.keys(state.watchlist.items || {}).forEach(id => {
        const li = document.createElement('li');
        // protegemos en caso de no existir precio
        const price = parseFloat((state.market && state.market.prices && state.market.prices[id]) || 0);
        li.textContent = `${id}: $${isNaN(price) ? '0.00' : price.toFixed(2)}`;
        wl.appendChild(li);
      });
    }

    const sr = wrapper.querySelector('#search-results');
    if (sr) {
      sr.innerHTML = '';
      (state.ui && Array.isArray(state.ui.searchResults) ? state.ui.searchResults : []).forEach(a => {
        const li = document.createElement('li');
        li.textContent = `${a.name} (${a.symbol})`;
        sr.appendChild(li);
      });
    }
  });

  // Reemplazamos los placeholders por los componentes reales (si existen)
  const tradingPlaceholder = wrapper.querySelector('#trading-placeholder');
  if (tradingPlaceholder) tradingPlaceholder.replaceWith(renderTradingPanel(store, facade));

  const chartPlaceholder = wrapper.querySelector('#chart-placeholder');
  if (chartPlaceholder) chartPlaceholder.replaceWith(renderChart(store, facade));

  return wrapper;
}