export default function renderTradingPanel(store, facade) {
  const div = document.createElement('section');
  div.id = 'trading-panel';
  div.innerHTML = `
    <h3>Mi Cartera</h3>
    <div>USDT: <span id="usdt">10000</span></div>
    <div>BTC: <span id="btc">0</span></div>
    <input id="amount" type="number" step="0.0001" placeholder="Cantidad BTC">
    <button id="buy">Comprar</button>
    <button id="sell">Vender</button>
    <table id="orders">
      <thead><tr><th>Fecha</th><th>Tipo</th><th>Cantidad</th><th>Precio</th></tr></thead>
      <tbody></tbody>
    </table>
  `;

  const amount = div.querySelector('#amount');
  const usdt = div.querySelector('#usdt');
  const btc = div.querySelector('#btc');
  const tbody = div.querySelector('tbody');

  function refresh() {
    const { wallet, orders } = store.getState();
    usdt.textContent = wallet.USDT.toFixed(2);
    btc.textContent = wallet.BTC.toFixed(4);
    tbody.innerHTML = orders.slice(-5).reverse().map(o => `
      <tr>
        <td>${new Date(o.time).toLocaleTimeString()}</td>
        <td>${o.side}</td>
        <td>${o.qty}</td>
        <td>${o.price.toFixed(2)}</td>
      </tr>`).join('');
  }

  div.querySelector('#buy').onclick = () => {
    const qty = parseFloat(amount.value);
    if (!qty || qty <= 0) return;
    const price = parseFloat(store.getState().market.prices.btcusdt);
    const cost = qty * price;
    if (store.getState().wallet.USDT < cost) return alert('Sin saldo USDT');
    store.dispatch({ type: 'wallet/updateBalance', payload: { asset: 'USDT', amount: -cost } });
    store.dispatch({ type: 'wallet/updateBalance', payload: { asset: 'BTC', amount: qty } });
    store.dispatch({ type: 'orders/addOrder', payload: { side: 'BUY', qty, price, time: Date.now() } });
    amount.value = '';
  };

  div.querySelector('#sell').onclick = () => {
    const qty = parseFloat(amount.value);
    if (!qty || qty <= 0) return;
    if (store.getState().wallet.BTC < qty) return alert('Sin saldo BTC');
    const price = parseFloat(store.getState().market.prices.btcusdt);
    const income = qty * price;
    store.dispatch({ type: 'wallet/updateBalance', payload: { asset: 'BTC', amount: -qty } });
    store.dispatch({ type: 'wallet/updateBalance', payload: { asset: 'USDT', amount: income } });
    store.dispatch({ type: 'orders/addOrder', payload: { side: 'SELL', qty, price, time: Date.now() } });
    amount.value = '';
  };

  store.subscribe(refresh);
  refresh();
  return div;
}