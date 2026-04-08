import { useEffect, useState } from "react";
import { HAS_API_CONFIG } from "../constants/autoInvest";
import { openChartSeriesStream } from "../services/autoInvestApi";

export default function useChartSeries(symbol, baseline) {
  const [series, setSeries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    if (!symbol) {
      setSeries([]);
      setFetchError("");
      setIsLoading(false);
      return undefined;
    }

    if (!HAS_API_CONFIG) {
      setSeries([]);
      setFetchError("API 설정이 없어 실시간 차트를 연결할 수 없습니다.");
      setIsLoading(false);
      return undefined;
    }

    setSeries([]);
    setIsLoading(true);
    setFetchError("");

    const stream = openChartSeriesStream(symbol, baseline, {
      onData(nextSeries) {
        setSeries((currentSeries) => {
          const mergedSeries = stream.mergeSeries(currentSeries, nextSeries);
          return mergedSeries;
        });
        setIsLoading(false);
        setFetchError("");
      },
      onError(error) {
        setIsLoading(false);
        setFetchError(`차트 데이터를 불러오지 못했습니다. ${error.message}`);
      },
    });

    return () => stream.close();
  }, [symbol, baseline]);

  return {
    series,
    isLoading,
    fetchError,
  };
}
