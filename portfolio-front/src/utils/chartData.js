export function formatTimeLabel(value) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value ?? "");
  }

  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function makeMockSeries(base = 60000, points = 70) {
  const now = Date.now();
  const stepMs = 60 * 1000;
  let close = Number(base) || 60000;

  const out = [];

  for (let i = points - 1; i >= 0; i -= 1) {
    const timestamp = new Date(now - i * stepMs);
    const open = close;
    const drift = (Math.random() - 0.5) * (base * 0.01);

    close = Math.max(1, Math.round(open + drift));

    const high = Math.max(open, close) + Math.round(Math.random() * (base * 0.004));
    const low = Math.max(1, Math.min(open, close) - Math.round(Math.random() * (base * 0.004)));

    out.push({
      time: formatTimeLabel(timestamp),
      timestamp: timestamp.toISOString(),
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(low),
      close: Math.round(close),
    });
  }

  return out;
}

export function normalizeCandle(item, index) {
  const timeValue = item.time ?? item.timestamp ?? item.date ?? item.datetime ?? item.x ?? index;
  const open = Number(item.open ?? item.o);
  const high = Number(item.high ?? item.h);
  const low = Number(item.low ?? item.l);
  const close = Number(item.close ?? item.c ?? item.price);

  if (![open, high, low, close].every(Number.isFinite)) {
    return null;
  }

  return {
    time: formatTimeLabel(timeValue),
    timestamp: typeof timeValue === "string" ? timeValue : String(timeValue),
    open: Math.round(open),
    high: Math.round(high),
    low: Math.round(low),
    close: Math.round(close),
  };
}

export function extractSeries(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.candles)) return payload.candles;
  if (Array.isArray(payload?.chart)) return payload.chart;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}
