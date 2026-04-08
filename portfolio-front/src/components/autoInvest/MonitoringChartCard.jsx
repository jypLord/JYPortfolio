import PriceChart from "./PriceChart.jsx";
import useChartSeries from "../../hooks/useChartSeries";

export default function MonitoringChartCard({ item }) {
  const { series, isLoading, fetchError } = useChartSeries(item.symbol, item.baseline);
  const hasSeries = series.length > 0;

  return (
    <article className="autoChartCard">
      <div className="autoChartTop">
        <div className="autoSymbolBadge">{item.symbol}</div>
      </div>

      <div className="autoChartBody">
        {hasSeries ? <PriceChart data={series} baseline={item.baseline} /> : null}
      </div>

      {isLoading ? <p className="autoChartStatus">불러오는 중...</p> : null}
      {fetchError ? <p className="autoChartStatus isError">{fetchError}</p> : null}
      {!isLoading && !fetchError && !hasSeries ? <p className="autoChartStatus">수신된 차트 데이터가 없습니다.</p> : null}
    </article>
  );
}
