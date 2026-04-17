import { useEffect, useState } from "react";
import { HAS_API_CONFIG } from "../constants/autoInvest";
import { fetchChartSeries } from "../services/autoInvestApi";

const MARKET_TIME_ZONE = "Asia/Seoul";
const MARKET_FETCH_HOUR = 15;
const MARKET_FETCH_MINUTE = 30;

function formatSeoulTime(date) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: MARKET_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function getMarketBoundaryParts(date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: MARKET_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  return { year, month, day };
}

function getSeoulTargetTime(now = new Date()) {
  const { year, month, day } = getMarketBoundaryParts(now);
  const utcTimestamp = Date.UTC(year, month - 1, day, MARKET_FETCH_HOUR - 9, MARKET_FETCH_MINUTE, 0, 0);
  return new Date(utcTimestamp);
}

function createScheduledMessage(targetTime) {
  return `${formatSeoulTime(targetTime)}(KST)에 차트를 1회 조회합니다.`;
}

function createInitialState(symbol) {
  if (!symbol) {
    return {
      series: [],
      isLoading: false,
      fetchError: "",
      statusMessage: "",
    };
  }

  if (!HAS_API_CONFIG) {
    return {
      series: [],
      isLoading: false,
      fetchError: "API 설정이 없습니다.",
      statusMessage: "",
    };
  }

  const targetTime = getSeoulTargetTime();
  const shouldFetchNow = Date.now() >= targetTime.getTime();

  return {
    series: [],
    isLoading: shouldFetchNow,
    fetchError: "",
    statusMessage: shouldFetchNow ? "" : createScheduledMessage(targetTime),
  };
}

export default function useChartSeries(symbol) {
  const [state, setState] = useState(() => createInitialState(symbol));

  useEffect(() => {
    if (!symbol || !HAS_API_CONFIG) {
      setState(createInitialState(symbol));
      return undefined;
    }

    const abortController = new AbortController();
    const targetTime = getSeoulTargetTime();
    const waitMs = Math.max(targetTime.getTime() - Date.now(), 0);
    let timerId = null;

    async function loadSeries() {
      setState((currentState) => ({
        ...currentState,
        isLoading: true,
        fetchError: "",
        statusMessage: "",
      }));

      try {
        const nextSeries = await fetchChartSeries(symbol, {
          signal: abortController.signal,
        });

        setState({
          series: nextSeries,
          isLoading: false,
          fetchError: "",
          statusMessage: `차트 데이터를 ${formatSeoulTime(new Date())}(KST)에 조회했습니다.`,
        });
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        setState({
          series: [],
          isLoading: false,
          fetchError: `차트 데이터를 불러오지 못했습니다. ${error.message}`,
          statusMessage: "",
        });
      }
    }

    setState({
      series: [],
      isLoading: waitMs === 0,
      fetchError: "",
      statusMessage: waitMs === 0 ? "" : createScheduledMessage(targetTime),
    });

    if (waitMs === 0) {
      loadSeries();
    } else {
      timerId = window.setTimeout(loadSeries, waitMs);
    }

    return () => {
      abortController.abort();

      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
    };
  }, [symbol]);

  return state;
}
