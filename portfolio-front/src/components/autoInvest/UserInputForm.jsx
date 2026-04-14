import "./UserInputForm.css";

export default function UserInputForm({
  symbol,
  buyAmount,
  baseline,
  onChangeSymbol,
  onChangeBuyAmount,
  onChangeBaseline,
  onSubmit,
  submitLabel = "Start",
}) {
  return (
    <section className="aiForm">
      <h3 className="aiFormTitle">Monitor one stock</h3>

      <form className="aiFormBody" onSubmit={onSubmit}>
        <div className="aiGrid">
          <label className="aiField">
            <span className="aiLabel">Stock symbol</span>
            <input
              className="aiInput"
              value={symbol}
              onChange={(event) => onChangeSymbol(event.target.value)}
              placeholder="AAPL"
            />
          </label>

          <label className="aiField">
            <span className="aiLabel">Buy amount</span>
            <input
              className="aiInput"
              value={buyAmount}
              onChange={(event) => onChangeBuyAmount(event.target.value)}
              placeholder="1000000"
              inputMode="numeric"
            />
          </label>

          <label className="aiField">
            <span className="aiLabel">Baseline price</span>
            <input
              className="aiInput"
              value={baseline}
              onChange={(event) => onChangeBaseline(event.target.value)}
              placeholder="60000"
              inputMode="numeric"
            />
          </label>
        </div>

        <button type="submit" className="aiSubmitBtn">
          {submitLabel}
        </button>
      </form>
    </section>
  );
}
