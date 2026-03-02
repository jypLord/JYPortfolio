import "./PriceControls.css";

export default function PriceControls({ onUp, onDown }) {
  return (
      <div className="aiBtnCol">
        <button className="aiBtn up" type="button" onClick={onUp}>
          가격 올리기
        </button>
        <button className="aiBtn down" type="button" onClick={onDown}>
          가격 내리기
        </button>
      </div>
  );
}