import { useEffect, useMemo, useRef, useState } from "react";
import PriceChart from "./PriceChart.jsx";
import useChartSeries from "../../hooks/useChartSeries";

function adjustPriceByPercent(price, direction) {
  const basePrice = Number(price);

  if (!Number.isFinite(basePrice) || basePrice <= 0) {
    return basePrice;
  }

  const ratio = direction === "up" ? 1.01 : 0.99;
  return Math.max(1, Math.round(basePrice * ratio));
}

function hasReachedBaseline(previousPrice, nextPrice, baseline) {
  if (!Number.isFinite(previousPrice) || !Number.isFinite(nextPrice) || !Number.isFinite(baseline)) {
    return false;
  }

  if (nextPrice === baseline) {
    return true;
  }

  return (
    (previousPrice < baseline && nextPrice > baseline) ||
    (previousPrice > baseline && nextPrice < baseline)
  );
}

export default function MonitoringChartCard({ item }) {
  const { series, isLoading, fetchError } = useChartSeries(item.symbol);
  const [simulatedPrice, setSimulatedPrice] = useState(null);
  const [isExecuted, setIsExecuted] = useState(false);
  const lastObservedPriceRef = useRef(null);
  const hasSeries = series.length > 0;
  const latestClose = series[series.length - 1]?.close;

  useEffect(() => {
    if (!Number.isFinite(latestClose)) {
      return;
    }

    const previousPrice = lastObservedPriceRef.current;
    const shouldExecute = hasReachedBaseline(previousPrice, latestClose, item.baseline);
    lastObservedPriceRef.current = latestClose;

    queueMicrotask(() => {
      setSimulatedPrice(latestClose);

      if (shouldExecute) {
        setIsExecuted(true);
      }
    });
  }, [item.baseline, latestClose]);

  const chartData = useMemo(() => {
    if (!hasSeries || !Number.isFinite(simulatedPrice)) {
      return series;
    }

    const nextSeries = [...series];
    const latestIndex = nextSeries.length - 1;
    const latestItem = nextSeries[latestIndex];

    nextSeries[latestIndex] = {
      ...latestItem,
      high: Math.max(latestItem.high, simulatedPrice),
      low: Math.min(latestItem.low, simulatedPrice),
      close: simulatedPrice,
    };

    return nextSeries;
  }, [hasSeries, series, simulatedPrice]);

  function handleAdjustPrice(direction) {
    setSimulatedPrice((currentPrice) => {
      const nextPrice = adjustPriceByPercent(currentPrice, direction);

      if (hasReachedBaseline(currentPrice, nextPrice, item.baseline)) {
        setIsExecuted(true);
      }

      lastObservedPriceRef.current = nextPrice;
      return nextPrice;
    });
  }

  return (
    <article className="autoChartCard">
      <div className="autoChartTop">
        <div className="autoSymbolBadge">{item.symbol}</div>
        <div className="autoChartControls">
          <button
            type="button"
            className="autoPriceBtn"
            onClick={() => handleAdjustPrice("down")}
            disabled={!hasSeries}
          >
            가격 내리기
          </button>
          <button
            type="button"
            className="autoPriceBtn"
            onClick={() => handleAdjustPrice("up")}
            disabled={!hasSeries}
          >
            가격 올리기
          </button>
        </div>
      </div>

      <div className="autoChartBody">
        {hasSeries ? (
          <PriceChart
            data={chartData}
            baseline={item.baseline}
            currentPrice={simulatedPrice}
            isExecuted={isExecuted}
          />
        ) : null}
      </div>

      {isLoading ? <p className="autoChartStatus">불러오는 중...</p> : null}
      {fetchError ? <p className="autoChartStatus isError">{fetchError}</p> : null}
      {!isLoading && !fetchError && !hasSeries ? <p className="autoChartStatus">수신된 차트 데이터가 없습니다.</p> : null}
    </article>
  );
}
