import React from "react";
import { observer } from "mobx-react-lite";
import currencyStore from "../stores/CurrencyStore";

interface CurrencyInputProps {
  currency: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const CurrencyInput: React.FC<CurrencyInputProps> = observer(({ 
  currency, 
  value, 
  onChange,
  disabled = false
}) => {
  const isDisabled = disabled || currencyStore.isLoading || !currencyStore.rates;
  
  return (
    <div className="currency-input">
      <div className="currency-label">
        <span className="currency-code">{currency}</span>
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isDisabled ? "Загрузка..." : "0.00"}
        disabled={isDisabled}
        style={{ opacity: isDisabled ? 0.7 : 1 }}
      />
    </div>
  );
});

export default CurrencyInput;