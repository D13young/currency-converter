import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import currencyStore from "../stores/CurrencyStore";

const AddCurrencyPair: React.FC = observer(() => {
  const [from, setFrom] = useState("RUB");
  const [to, setTo] = useState("USD");
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!from || !to) {
      setError("Выберите обе валюты");
      return;
    }
    
    if (from === to) {
      setError("Валюты должны быть разными");
      return;
    }
    
    currencyStore.addPair(from, to);
    setError("");
  };

  return (
    <div className="add-pair">
      <h3>Добавить валютную пару</h3>
      
      <div className="pair-selectors">
        <select 
          value={from} 
          onChange={(e) => setFrom(e.target.value)}
          disabled={currencyStore.isLoading}
        >
          {currencyStore.currencies.map(currency => (
            <option key={`from-${currency}`} value={currency}>
              {currency}
            </option>
          ))}
        </select>
        
        <span>→</span>
        
        <select 
          value={to} 
          onChange={(e) => setTo(e.target.value)}
          disabled={currencyStore.isLoading}
        >
          {currencyStore.currencies.map(currency => (
            <option key={`to-${currency}`} value={currency}>
              {currency}
            </option>
          ))}
        </select>
        
        <button 
          onClick={handleAdd}
          disabled={currencyStore.isLoading}
        >
          Добавить
        </button>
      </div>
      
      {error && <div className="error">{error}</div>}
    </div>
  );
});

export default AddCurrencyPair;