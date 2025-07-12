import React from "react";
import { observer } from "mobx-react-lite";
import currencyStore from "../stores/CurrencyStore";
import CurrencyInput from "./CurrencyInput";

interface CurrencyPairProps {
  pair: {
    id: string;
    from: string;
    to: string;
    amountFrom: string;
    amountTo: string;
  };
}

const CurrencyPair: React.FC<CurrencyPairProps> = observer(({ pair }) => {
  return (
    <div className="currency-pair">
      <CurrencyInput
        currency={pair.from}
        value={pair.amountFrom}
        onChange={(value) => currencyStore.updateAmount(pair.id, value, true)}
      />
      
      <div className="exchange-icon">⇄</div>
      
      <CurrencyInput
        currency={pair.to}
        value={pair.amountTo}
        onChange={(value) => currencyStore.updateAmount(pair.id, value, false)}
        disabled={currencyStore.isLoading}
      />
      
      <button 
        className="remove-button"
        onClick={() => currencyStore.removePair(pair.id)}
        title="Удалить пару"
      >
        ×
      </button>
    </div>
  );
});

export default CurrencyPair;