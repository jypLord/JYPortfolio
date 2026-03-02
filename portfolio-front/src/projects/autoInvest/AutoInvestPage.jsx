import { useEffect, useMemo, useState } from "react";
import Navbar from "../../common/components/navbar/Navbar.jsx";
import "./AutoInvestPage.css";

import AutoInvestHeader from "./components/AutoInvestHeader/AutoInvestHeader.jsx";
import UserInputForm from "./components/UserInputForm/UserInputForm.jsx";
import PriceChart from "./components/Chart/Chart.jsx";
import PriceControls from "./components/PriceControls/PriceControls.jsx";

// 지금은 API 대신 mock 데이터(나중에 fetch로 교체)
function makeMockSeries(base = 60000, points = 70) {
  const now = Date.now();
  const stepMs = 60 * 1000;
  let p = Number(base) || 60000;

  const out = [];
  for (let i = points - 1; i >= 0; i--) {
    const t = new Date(now - i * stepMs);
    const noise = (Math.random() - 0.5) * (base * 0.01);
    p = Math.max(1, p + noise);

    out.push({
      time: `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`,
      price: Math.round(p),
    });
  }
  return out;
}

export default function AutoInvestPage() {
  // 사용자 입력
  const [symbol, setSymbol] = useState("삼성전자");
  const [buyAmount, setBuyAmount] = useState("1000000");
  const [baseline, setBaseline] = useState("60000");

  // 차트 원본 데이터 + 1% 변동
  const [baseSeries, setBaseSeries] = useState(() => makeMockSeries(60000, 70));
  const [mult, setMult] = useState(1);

  // TODO: 나중에 여기만 fetch로 바꾸면 됨
  const loadSeries = async (sym, base) => {
    // const res = await fetch(`/api/chart?symbol=${encodeURIComponent(sym)}`);
    // const json = await res.json(); // [{time, price}, ...]
    // setBaseSeries(json);

    setBaseSeries(makeMockSeries(Number(base) || 60000, 70));
  };

  useEffect(() => {
    loadSeries(symbol, baseline);
    setMult(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, baseline]);

  const series = useMemo(() => {
    const m = Number(mult) || 1;
    return baseSeries.map((d) => ({ ...d, price: Math.round(d.price * m) }));
  }, [baseSeries, mult]);

  const baselineNum = Number(baseline);
  const lastPrice = series.length ? series[series.length - 1].price : 0;

  const onUp = () => setMult((v) => +(Number(v) * 1.01).toFixed(6));
  const onDown = () => setMult((v) => +(Number(v) * 0.99).toFixed(6));

  return (
      <div className="app">
        <Navbar />

        <main className="autoMain">
          <AutoInvestHeader />

          <UserInputForm
              symbol={symbol}
              buyAmount={buyAmount}
              baseline={baseline}
              onChangeSymbol={setSymbol}
              onChangeBuyAmount={(v) => setBuyAmount(v.replace(/[^\d]/g, ""))}
              onChangeBaseline={(v) => setBaseline(v.replace(/[^\d]/g, ""))}
          />

          <section className="autoChartSection">
            <div className="autoChartCard">
              <div className="autoChartTop">
                <div className="autoMeta">
                  <div className="metaItem">
                    <span className="metaKey">종목</span>
                    <span className="metaVal">{symbol || "-"}</span>
                  </div>
                  <div className="metaItem">
                    <span className="metaKey">매수액</span>
                    <span className="metaVal">{(Number(buyAmount) || 0).toLocaleString()}원</span>
                  </div>
                  <div className="metaItem">
                    <span className="metaKey">현재가(시뮬)</span>
                    <span className="metaVal">{(Number(lastPrice) || 0).toLocaleString()}</span>
                  </div>
                </div>

                <PriceControls onUp={onUp} onDown={onDown} />
              </div>

              <div className="autoChartBody">
                <PriceChart data={series} baseline={baselineNum} />
              </div>
            </div>
          </section>
        </main>
      </div>
  );
}