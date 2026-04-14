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
      fetchError: "API configuration is missing.",
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
          fetchError: `Unable to load chart data. ${error.message}`,
        }));
      },
    });

    return () => stream.close();
  }, [symbol]);

  return state;
}
