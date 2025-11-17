import { createChart } from 'https://cdn.skypack.dev/lightweight-charts';

export default function renderChart(store, facade) {
  const div = document.createElement('div');
  div.id = 'chart-container';
  const chart = createChart(div, { width: 800, height: 400 });
  const series = chart.addCandlestickSeries();

  facade.candleSubscribe(candles => {
    series.setData(candles.map(c => ({
      time: c.t / 1000,
      open: c.o,
      high: c.h,
      low: c.l,
      close: c.c,
    })));
  });

  return div;
}