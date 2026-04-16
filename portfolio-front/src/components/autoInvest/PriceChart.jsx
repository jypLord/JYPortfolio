import "./PriceChart.css";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CURRENT_PRICE_TAG_COLOR = "#03c75a";
const CHART_HEIGHT = 320;
const CHART_MARGIN = { top: 10, right: 96, left: 0, bottom: 28 };
const OVERLAY_VIEWBOX_WIDTH = 1000;

function renderCandle({
  item,
  index,
  centerX,
  candleWidth,
  highY,
  lowY,
  top,
  bodyHeight,
  stroke,
  fill,
}) {
  return (
    <g key={`${item.timestamp}-${index}`}>
      <line
        x1={centerX}
        x2={centerX}
        y1={highY}
        y2={lowY}
        stroke={stroke}
        strokeWidth={1.5}
      />
      <rect
        x={centerX - candleWidth / 2}
        y={top}
        width={candleWidth}
        height={bodyHeight}
        rx={2}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
      />
    </g>
  );
}

function getYCoordinate(value, minDomain, maxDomain, top, height) {
  if (!Number.isFinite(value) || !Number.isFinite(minDomain) || !Number.isFinite(maxDomain)) {
    return null;
  }

  if (maxDomain <= minDomain) {
    return top + height / 2;
  }

  const normalized = (value - minDomain) / (maxDomain - minDomain);
  return top + height - normalized * height;
}

function CurrentPriceTag({
  currentItem,
  currentPrice,
  candleWidth,
  chartRight,
  minDomain,
  maxDomain,
  plotTop,
  plotHeight,
  getXCoordinate,
}) {
  if (!currentItem) {
    return null;
  }

  const currentIndex = getXCoordinate.indexOf(currentItem.timestamp);
  const currentXValue = getXCoordinate.at(currentIndex);
  const currentY = getYCoordinate(currentPrice, minDomain, maxDomain, plotTop, plotHeight);

  if (!Number.isFinite(currentXValue) || !Number.isFinite(currentY)) {
    return null;
  }

  const centerX = currentXValue;
  const tagHeight = 28;
  const tagWidth = 94;
  const pointerGap = 10;
  const bodyLeft = chartRight - tagWidth;
  const tipX = Math.max(centerX + 10, bodyLeft - pointerGap);
  const topY = currentY - tagHeight / 2;
  const bottomY = currentY + tagHeight / 2;
  const points = [
    `${tipX},${currentY}`,
    `${bodyLeft},${topY}`,
    `${chartRight},${topY}`,
    `${chartRight},${bottomY}`,
    `${bodyLeft},${bottomY}`,
  ].join(" ");

  return (
    <g key="current-price-tag">
      <line
        x1={centerX + candleWidth / 2 + 2}
        x2={tipX}
        y1={currentY}
        y2={currentY}
        stroke={CURRENT_PRICE_TAG_COLOR}
        strokeWidth={1.5}
        strokeOpacity={0.85}
      />
      <polygon
        points={points}
        fill={CURRENT_PRICE_TAG_COLOR}
        stroke="rgba(3,199,90,0.24)"
        strokeWidth={1}
      />
      <text
        x={bodyLeft + (chartRight - bodyLeft) / 2}
        y={currentY}
        fill="#ffffff"
        fontSize={12}
        fontWeight={700}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {Number(currentPrice).toLocaleString()}
      </text>
    </g>
  );
}

function CandleOverlay({ data, currentPrice, yDomain }) {
  if (!data?.length) {
    return null;
  }

  const plotLeft = CHART_MARGIN.left;
  const plotTop = CHART_MARGIN.top;
  const plotRight = OVERLAY_VIEWBOX_WIDTH - CHART_MARGIN.right;
  const plotBottom = CHART_HEIGHT - CHART_MARGIN.bottom;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;
  const minDomain = yDomain[0];
  const maxDomain = yDomain[1];
  const slotWidth = data.length > 1 ? plotWidth / (data.length - 1) : plotWidth;
  const candleWidth = Math.max(6, Math.min(16, slotWidth * 0.5));
  const xCoordinates = data.map((_, index) => plotLeft + slotWidth * index);
  const getXCoordinate = {
    at(index) {
      return index >= 0 ? xCoordinates[index] : null;
    },
    indexOf(timestamp) {
      return data.findIndex((item) => item.timestamp === timestamp);
    },
  };

  return (
    <svg
      className="aiChartOverlay"
      viewBox={`0 0 ${OVERLAY_VIEWBOX_WIDTH} ${CHART_HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {data.map((item, index) => {
        const centerX = xCoordinates[index];
        const openY = getYCoordinate(item.open, minDomain, maxDomain, plotTop, plotHeight);
        const closeY = getYCoordinate(item.close, minDomain, maxDomain, plotTop, plotHeight);
        const highY = getYCoordinate(item.high, minDomain, maxDomain, plotTop, plotHeight);
        const lowY = getYCoordinate(item.low, minDomain, maxDomain, plotTop, plotHeight);

        if (![centerX, openY, closeY, highY, lowY].every(Number.isFinite)) {
          return null;
        }

        const top = Math.min(openY, closeY);
        const bottom = Math.max(openY, closeY);
        const bodyHeight = Math.max(2, bottom - top);
        const isUp = item.close >= item.open;
        const stroke = isUp ? "#ff6b6b" : "#4d96ff";
        const fill = isUp ? "rgba(255,107,107,0.28)" : "rgba(77,150,255,0.28)";

        return renderCandle({
          item,
          index,
          centerX,
          candleWidth,
          highY,
          lowY,
          top,
          bodyHeight,
          stroke,
          fill,
        });
      })}

      <CurrentPriceTag
        currentItem={data[data.length - 1]}
        currentPrice={currentPrice}
        candleWidth={candleWidth}
        chartRight={plotRight}
        minDomain={minDomain}
        maxDomain={maxDomain}
        plotTop={plotTop}
        plotHeight={plotHeight}
        getXCoordinate={getXCoordinate}
      />
    </svg>
  );
}

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString()}원`;
}

function CandleTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload;
  if (!item) {
    return null;
  }

  return (
    <div className="aiChartTooltip">
      <div className="aiChartTooltipLabel">{label}</div>
      <div>시가: {formatPrice(item.open)}</div>
      <div>고가: {formatPrice(item.high)}</div>
      <div>저가: {formatPrice(item.low)}</div>
      <div>종가: {formatPrice(item.close)}</div>
    </div>
  );
}

export default function PriceChart({ data, baseline, currentPrice, isExecuted }) {
  const baselineOk = Number.isFinite(baseline) && baseline > 0;
  const currentPriceOk = Number.isFinite(currentPrice) && currentPrice > 0;
  const priceCandidates = [
    ...data.flatMap((item) => [item.low, item.high, item.open, item.close].filter(Number.isFinite)),
    ...(baselineOk ? [baseline] : []),
    ...(currentPriceOk ? [currentPrice] : []),
  ];
  const minPrice = priceCandidates.length ? Math.min(...priceCandidates) : 0;
  const maxPrice = priceCandidates.length ? Math.max(...priceCandidates) : 0;
  const range = Math.max(maxPrice - minPrice, maxPrice * 0.04, 1000);
  const padding = Math.max(Math.ceil(range * 0.12), 500);
  const yDomain = [Math.max(0, minPrice - padding), maxPrice + padding];

  return (
    <div className="aiChartWrap">
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <ComposedChart data={data} margin={CHART_MARGIN}>
          <CartesianGrid stroke="rgba(3,199,90,0.08)" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: "#6b7280", fontSize: 12 }}
            minTickGap={24}
          />
          <YAxis
            hide
            width={0}
            domain={yDomain}
          />
          <Tooltip content={<CandleTooltip />} cursor={{ stroke: "rgba(3,199,90,0.16)" }} />
          <Line dataKey="close" stroke="transparent" dot={false} activeDot={false} />

          {baselineOk && (
            <ReferenceLine
              y={baseline}
              stroke="#ffb84d"
              strokeWidth={2}
              strokeDasharray="4 4"
              label={{
                value: `기준가 ${baseline.toLocaleString()}원`,
                position: "insideTopRight",
                fill: "#6b7280",
                fontSize: 12,
              }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
      <CandleOverlay
        data={data}
        currentPrice={currentPriceOk ? currentPrice : data[data.length - 1]?.close}
        yDomain={yDomain}
      />

      {isExecuted ? (
        <div className="aiExecutionNotice">
          주문이 체결되었습니다
        </div>
      ) : null}
    </div>
  );
}
