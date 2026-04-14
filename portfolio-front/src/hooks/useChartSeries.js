import { useEffect, useState } from "react";
import { HAS_API_CONFIG } from "../constants/autoInvest";
import { openChartSeriesStream } from "../services/autoInvestApi";

function createInitialState(symbol) {
  if (!symbol) {
    return {
      series: [],
      isLoading: false,
      fetchError: "",
    };
  }

  if (!HAS_API_CONFIG) {
    return {
      series: [],
      isLoading: false,
      fetchError: "API 설정이 없습니다.",
    };
  }

  return {
    series: [],
    isLoading: true,
    fetchError: "",
  };
}

export default function useChartSeries(symbol) {
  const [state, setState] = useState(() => createInitialState(symbol));

  useEffect(() => {
    if (!symbol || !HAS_API_CONFIG) {
      return undefined;
    }

    const stream = openChartSeriesStream(symbol, {
      onData(nextSeries) {
        setState((currentState) => ({
          series: stream.mergeSeries(currentState.series, nextSeries),
          isLoading: false,
          fetchError: "",
        }));
      },
      onError(error) {
        setState((currentState) => ({
          ...currentState,
          isLoading: false,
          fetchError: `차트 데이터를 불러오지 못했습니다. ${error.message}`,
        }));
      },
    });

    return () => stream.close();
  }, [symbol]);

  return state;
}
