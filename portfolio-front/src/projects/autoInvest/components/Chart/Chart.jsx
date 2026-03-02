import "./PriceChart.css";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

export default function PriceChart({ data, baseline }) {
  const baselineOk = Number.isFinite(baseline) && baseline > 0;

  return (
      <div className="aiChartWrap">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }} width={60} domain={["auto", "auto"]} />
            <Tooltip
                contentStyle={{
                  background: "rgba(20,20,26,0.92)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 12,
                  color: "rgba(255,255,255,0.9)",
                }}
                labelStyle={{ color: "rgba(255,255,255,0.7)" }}
            />

            <Line
                type="monotone"
                dataKey="price"
                stroke="rgba(124,92,255,0.95)"
                strokeWidth={2.2}
                dot={false}
                activeDot={{ r: 4 }}
            />

            {/* ✅ 기준가 빨간선 + 오른쪽 아래 기준가 표시 */}
            {baselineOk && (
                <ReferenceLine
                    y={baseline}
                    stroke="#ff3b3b"
                    strokeWidth={2}
                    label={{
                      value: `기준가 ${baseline.toLocaleString()}`,
                      position: "right",
                      fill: "rgba(255,255,255,0.70)",
                      fontSize: 12,
                      dy: 14, // 오른쪽 "아래" 느낌
                    }}
                />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
  );
}