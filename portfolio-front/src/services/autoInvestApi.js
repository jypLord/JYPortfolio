import {
  API_BASE_URL,
  API_CHART_PATH,
  API_SAVE_PATH,
} from "../constants/autoInvest";
import {
  extractSeries,
  normalizeCandle,
} from "../utils/chartData";

function buildApiUrl(path) {
  const baseUrl = API_BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!baseUrl) {
    return normalizedPath;
  }

  return new URL(`${baseUrl}${normalizedPath}`).toString();
}

export function buildChartUrl(symbol, baseline) {
  const url = new URL(buildApiUrl(API_CHART_PATH));

  if (symbol.trim()) {
    url.searchParams.set("symbol", symbol.trim());
  }

  if (baseline != null) {
    url.searchParams.set("baseline", String(baseline));
  }

  return url.toString();
}

export function buildSaveUrl() {
  return buildApiUrl(API_SAVE_PATH);
}

function normalizeSeriesPayload(payload) {
  const extracted = extractSeries(payload);

  if (extracted.length) {
    return extracted
      .map(normalizeCandle)
      .filter(Boolean);
  }

  const singleItem = normalizeCandle(payload, 0);
  return singleItem ? [singleItem] : [];
}

function mergeSeries(currentSeries, incomingSeries, limit = 70) {
  const byTimestamp = new Map(
    currentSeries.map((item) => [item.timestamp, item]),
  );

  incomingSeries.forEach((item) => {
    byTimestamp.set(item.timestamp, item);
  });

  return Array.from(byTimestamp.values())
    .sort((left, right) => String(left.timestamp).localeCompare(String(right.timestamp)))
    .slice(-limit);
}

export function openChartSeriesStream(symbol, baseline, { onData, onError }) {
  const eventSource = new EventSource(buildChartUrl(symbol, baseline));

  eventSource.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      const nextSeries = normalizeSeriesPayload(payload);

      if (!nextSeries.length) {
        return;
      }

      onData(nextSeries);
    } catch (error) {
      onError(error);
    }
  };

  eventSource.onerror = () => {
    onError(new Error("SSE connection failed"));
    eventSource.close();
  };

  return {
    close() {
      eventSource.close();
    },
    mergeSeries,
  };
}

export async function saveWatchItem(item) {
  const response = await fetch(buildSaveUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
}
