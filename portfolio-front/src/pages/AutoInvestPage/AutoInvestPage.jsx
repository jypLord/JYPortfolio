import { useRef, useState } from "react";
import Navbar from "../../common/components/navbar/Navbar.jsx";
import AutoInvestHeader from "../../components/autoInvest/AutoInvestHeader.jsx";
import UserInputForm from "../../components/autoInvest/UserInputForm.jsx";
import MonitoringChartCard from "../../components/autoInvest/MonitoringChartCard.jsx";
import "./AutoInvestPage.css";

let stockValidatorModulePromise;

function loadStockValidatorModule() {
  if (!stockValidatorModulePromise) {
    stockValidatorModulePromise = import("../../utils/StockValidator.js");
  }

  return stockValidatorModulePromise;
}

function buildItemId(symbol, baseline) {
  return `${symbol.trim().toUpperCase()}-${baseline}`;
}

export default function AutoInvestPage() {
  const [symbol, setSymbol] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [baseline, setBaseline] = useState("");
  const [activeItem, setActiveItem] = useState(null);
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const stockValidatorRef = useRef(null);

  async function validateSymbol(nextSymbol) {
    const stockValidator =
      stockValidatorRef.current ?? await loadStockValidatorModule();

    stockValidatorRef.current = stockValidator;

    if (!stockValidator.isValidStockName(nextSymbol)) {
      throw new Error("This stock symbol is not supported in the sample.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextSymbol = symbol.trim();
    const nextBuyAmount = Number(buyAmount);
    const nextBaseline = Number(baseline);

    setFormMessage("");
    setFormError("");

    if (
      !nextSymbol ||
      !Number.isFinite(nextBuyAmount) ||
      nextBuyAmount <= 0 ||
      !Number.isFinite(nextBaseline) ||
      nextBaseline <= 0
    ) {
      setFormError("Enter a stock symbol, buy amount, and baseline price.");
      return;
    }

    setIsSaving(true);

    try {
      await validateSymbol(nextSymbol);

      setActiveItem({
        id: buildItemId(nextSymbol, nextBaseline),
        symbol: nextSymbol,
        buyAmount: Math.round(nextBuyAmount),
        baseline: Math.round(nextBaseline),
      });
      setFormMessage("Streaming chart data for the selected stock.");
    } catch (error) {
      setFormError(`Unable to start monitoring. ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }

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
          onChangeBuyAmount={(value) => setBuyAmount(value.replace(/[^\d]/g, ""))}
          onChangeBaseline={(value) => setBaseline(value.replace(/[^\d]/g, ""))}
          onSubmit={handleSubmit}
          submitLabel={isSaving ? "Loading..." : "Start monitoring"}
        />

        <section className="autoConfigSection">
          <div>
            <h3 className="autoSectionTitle">Sample API flow</h3>
            <p className="autoSectionDesc">
              This page uses a single streaming endpoint:
              {" "}
              <code>api.jyportfolio.site/autoInvest?stockName=</code>.
              The backend does not persist a watchlist in this sample.
            </p>
          </div>

          {formError ? <p className="autoFeedback isError">{formError}</p> : null}
          {!formError && formMessage ? <p className="autoFeedback">{formMessage}</p> : null}

          {activeItem ? (
            <div className="autoCurrentConfig">
              <div className="autoConfigGrid">
                <div className="autoConfigItem">
                  <span className="autoConfigLabel">Stock</span>
                  <strong className="autoConfigValue">{activeItem.symbol}</strong>
                </div>
                <div className="autoConfigItem">
                  <span className="autoConfigLabel">Buy amount</span>
                  <strong className="autoConfigValue">
                    {activeItem.buyAmount.toLocaleString()}
                  </strong>
                </div>
                <div className="autoConfigItem">
                  <span className="autoConfigLabel">Baseline</span>
                  <strong className="autoConfigValue">
                    {activeItem.baseline.toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="autoEmptyState">
              Submit one stock to initialize 10 candles and continue streaming live data.
            </div>
          )}
        </section>

        {activeItem ? (
          <section className="autoChartSection">
            <MonitoringChartCard key={activeItem.id} item={activeItem} />
          </section>
        ) : null}
      </main>
    </div>
  );
}
