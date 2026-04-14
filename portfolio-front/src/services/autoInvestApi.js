import {
  API_BASE_URL,
  API_STREAM_PATH,
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

export function buildChartUrl(stockName) {
  const url = new URL(buildApiUrl(API_STREAM_PATH), window.location.origin);

  if (stockName.trim()) {
    url.searchParams.set("stockName", stockName.trim());
  }

  return url.toString();
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

export function openChartSeriesStream(stockName, { onData, onError }) {
  const eventSource = new EventSource(buildChartUrl(stockName));

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
    onError(new Error("SSE 연결에 실패했습니다."));
    eventSource.close();
  };

  return {
    close() {
      eventSource.close();
    },
    mergeSeries,
  };
}
