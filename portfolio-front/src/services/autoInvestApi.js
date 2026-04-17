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

export async function fetchChartSeries(stockName, { signal } = {}) {
  const response = await fetch(buildChartUrl(stockName), { signal });

  if (!response.ok) {
    throw new Error(`차트 요청에 실패했습니다. (${response.status})`);
  }

  const payload = await response.json();
  const nextSeries = normalizeSeriesPayload(payload);

  if (!nextSeries.length) {
    throw new Error("수신된 차트 데이터가 없습니다.");
  }

  return nextSeries;
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
