import "./UserInputForm.css";

export default function UserInputForm({
  symbol,
  buyAmount,
  baseline,
  onChangeSymbol,
  onChangeBuyAmount,
  onChangeBaseline,
}) {
  return (
      <section className="aiForm">
        <h3 className="aiFormTitle">사용자 입력</h3>

        <div className="aiGrid">
          <label className="aiField">
            <span className="aiLabel">종목 이름</span>
            <input
                className="aiInput"
                value={symbol}
                onChange={(e) => onChangeSymbol(e.target.value)}
                placeholder="예: 삼성전자"
            />
          </label>

          <label className="aiField">
            <span className="aiLabel">매수액</span>
            <input
                className="aiInput"
                value={buyAmount}
                onChange={(e) => onChangeBuyAmount(e.target.value)}
                placeholder="예: 1000000"
                inputMode="numeric"
            />
          </label>

          <label className="aiField">
            <span className="aiLabel">기준가</span>
            <input
                className="aiInput"
                value={baseline}
                onChange={(e) => onChangeBaseline(e.target.value)}
                placeholder="예: 60000"
                inputMode="numeric"
            />
          </label>
        </div>
      </section>
  );
}