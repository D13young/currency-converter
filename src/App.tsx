import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import CurrencyPair from "./components/CurrencyPair";
import AddCurrencyPair from "./components/AddCurrencyPair";
import currencyStore from "./stores/CurrencyStore";

const App: React.FC = observer(() => {
  useEffect(() => {
    if (!currencyStore.rates && !currencyStore.isLoading) {
      currencyStore.fetchRates();
    }
  }, []);

  if (currencyStore.isLoading && !currencyStore.error) {
    return (
      <div className="app-loading">
        <h1>Загрузка курсов валют...</h1>
        <div className="spinner"></div>
        <p>Пожалуйста, подождите</p>
      </div>
    );
  }

  if (currencyStore.error) {
    return (
      <div className="app-error">
        <h1>Ошибка загрузки данных</h1>
        <p>{currencyStore.error}</p>
        <button onClick={() => currencyStore.fetchRates()}>
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>Курсы валют</h1>
        {currencyStore.lastUpdated && (
          <div className="last-updated">
            Обновлено: {new Date(currencyStore.lastUpdated).toLocaleTimeString()}
          </div>
        )}
      </header>

      <main>
        <div className="currency-pairs">
          {currencyStore.currencyPairs.map(pair => (
            <CurrencyPair key={pair.id} pair={pair} />
          ))}
        </div>
        
        <AddCurrencyPair />
      </main>

      <footer>
        <p>Курсы обновляются автоматически каждые 5 минут</p>
        <p>Источник данных: {currencyStore.lastUpdated ? "open.er-api.com" : "api.frankfurter.app"}</p>
      </footer>
    </div>
  );
});

export default App;