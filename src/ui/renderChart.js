// Implementación robusta de gráfico que usa Canvas como fallback.
// Se suscribe a facade.candleSubscribe(candles) y dibuja línea/candles sin depender de CDNs.
export default function renderChart(store, facade) {
  const container = document.createElement('div');
  container.id = 'chart-container';
  container.style.position = 'relative';
  container.style.width = '100%';
  container.style.maxWidth = '900px';

  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 400;
  canvas.style.width = '100%';
  canvas.style.height = '400px';
  canvas.style.display = 'block';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  // pequeña utilidad para reescalar canvas en high-DPI displays
  function resizeCanvasToDisplaySize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  // Dibuja un gráfico de línea simple (usando precio de cierre) o candlestick si vienen OHLC
  function drawChart(candles) {
    if (!Array.isArray(candles) || !candles.length) {
      // limpiar
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f6f6f6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }

    resizeCanvasToDisplaySize();

    // Preparar datos
    const points = candles.map(c => ({
      t: Math.floor(c.t / 1000),
      o: Number(c.o),
      h: Number(c.h),
      l: Number(c.l),
      c: Number(c.c),
    }));

    const values = points.flatMap(p => [p.o, p.h, p.l, p.c]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const paddingTop = 20;
    const paddingBottom = 30;
    const paddingLeft = 40;
    const paddingRight = 20;

    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);

    const chartW = w - paddingLeft - paddingRight;
    const chartH = h - paddingTop - paddingBottom;

    // limpiar fondo
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    // dibujar ejes y marcas
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, paddingTop);
    ctx.lineTo(paddingLeft, paddingTop + chartH);
    ctx.lineTo(paddingLeft + chartW, paddingTop + chartH);
    ctx.stroke();

    // escala precio -> y
    const priceToY = price => {
      const ratio = (price - min) / (max - min || 1);
      return paddingTop + chartH - ratio * chartH;
    };

    // dibujar ticks de precio
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    for (let i = 0; i <= 4; i++) {
      const p = min + (i / 4) * (max - min);
      const y = priceToY(p);
      ctx.fillText(p.toFixed(2), 4, y + 4);
      ctx.strokeStyle = '#f0f0f0';
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(paddingLeft + chartW, y);
      ctx.stroke();
    }

    const count = points.length;
    const stepX = chartW / Math.max(count - 1, 1);

    // Si existen campos high/low/open, dibujar candlesticks; si no, dibujar línea de cierres
    const hasOHLC = points.every(p => Number.isFinite(p.o) && Number.isFinite(p.h) && Number.isFinite(p.l) && Number.isFinite(p.c));

    if (hasOHLC) {
      // ancho de vela
      const candleW = Math.max(2, stepX * 0.6);
      points.forEach((p, i) => {
        const x = paddingLeft + i * stepX;
        const yOpen = priceToY(p.o);
        const yHigh = priceToY(p.h);
        const yLow = priceToY(p.l);
        const yClose = priceToY(p.c);

        // wick
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, yHigh);
        ctx.lineTo(x, yLow);
        ctx.stroke();

        // body
        if (p.c >= p.o) {
          // verde (alcista)
          ctx.fillStyle = '#2ecc71';
          ctx.strokeStyle = '#2ecc71';
        } else {
          // rojo (bajista)
          ctx.fillStyle = '#e74c3c';
          ctx.strokeStyle = '#e74c3c';
        }
        const bodyTop = Math.min(yOpen, yClose);
        const bodyHeight = Math.max(1, Math.abs(yClose - yOpen));
        ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyHeight);
        ctx.strokeRect(x - candleW / 2, bodyTop, candleW, bodyHeight);
      });
    } else {
      // línea de cierres
      ctx.strokeStyle = '#2980b9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      points.forEach((p, i) => {
        const x = paddingLeft + i * stepX;
        const y = priceToY(p.c);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
  }

  // Suscripción a facade (cuando lleguen velas)
  let latestCandles = [];
  facade.candleSubscribe(candles => {
    // los candles deberían venir en orden cronológico ascendente (o adaptamos)
    if (!Array.isArray(candles)) return;
    latestCandles = candles.slice(-200); // limitar para rendimiento
    drawChart(latestCandles);
  });

  // Redraw al cambiar tamaño de ventana
  window.addEventListener('resize', () => {
    drawChart(latestCandles);
  });

  return container;
}