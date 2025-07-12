import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";

export interface CurrencyPair {
  id: string;
  from: string;
  to: string;
  amountFrom: string;
  amountTo: string;
}

class CurrencyStore {
  currencyPairs: CurrencyPair[] = [];
  rates: Record<string, number> | null = null;
  currencies: string[] = [];
  isLoading = true;
  error: string | null = null;
  lastUpdated: number | null = null;

  constructor() {
    makeAutoObservable(this);
    this.loadSavedPairs();
    this.fetchRates();
    setInterval(() => this.fetchRates(), 5 * 60 * 1000);
  }

  async fetchRates() {
    try {
      this.isLoading = true;
      this.error = null;
      
      await this.tryPrimaryApi();
      
    } catch (error) {
      console.error("Ошибка при загрузке основного API:", error);
      await this.tryBackupApi();
    }
  }

  async tryPrimaryApi() {
    try {
      const response = await axios.get("https://open.er-api.com/v6/latest/USD", {
        timeout: 10000
      });
      
      if (response.data && response.data.rates) {
        const rates = response.data.rates;

        runInAction(() => {
          this.rates = rates;
          this.currencies = Object.keys(rates);
          this.isLoading = false;
          this.error = null;
          this.lastUpdated = Date.now();
          this.recalculateAllPairs();
        });
      } else {
        throw new Error("Неверный формат данных от основного API");
      }
    } catch (error) {
      console.error("Ошибка основного API:", error);
      throw error;
    }
  }

  async tryBackupApi() {
    try {
      const response = await axios.get("https://api.frankfurter.app/latest?from=USD", {
        timeout: 10000
      });
      
      if (response.data && response.data.rates) {
        const rates = { ...response.data.rates };
        rates["USD"] = 1;

        runInAction(() => {
          this.rates = rates;
          this.currencies = Object.keys(rates);
          this.isLoading = false;
          this.error = null;
          this.lastUpdated = Date.now();
          this.recalculateAllPairs();
        });
      } else {
        throw new Error("Неверный формат данных от резервного API");
      }
    } catch (error) {
      console.error("Ошибка резервного API:", error);
      runInAction(() => {
        this.isLoading = false;
        this.error = "Не удалось загрузить курсы валют. Попробуйте обновить страницу позже.";
      });
    }
  }

  loadSavedPairs() {
    const saved = localStorage.getItem("currencyPairs");
    if (saved) {
      try {
        this.currencyPairs = JSON.parse(saved);
      } catch (error) {
        console.error("Ошибка при загрузке сохраненных пар:", error);
        this.setDefaultPairs();
      }
    } else {
      this.setDefaultPairs();
    }
  }

  setDefaultPairs() {
    this.currencyPairs = [
      { id: this.generateId(), from: "RUB", to: "USD", amountFrom: "", amountTo: "" },
      { id: this.generateId(), from: "RUB", to: "EUR", amountFrom: "", amountTo: "" }
    ];
  }

  savePairs() {
    try {
      localStorage.setItem("currencyPairs", JSON.stringify(this.currencyPairs));
    } catch (error) {
      console.error("Ошибка при сохранении пар:", error);
    }
  }

  generateId() {
    return Math.random().toString(36).substring(2, 11);
  }

  addPair(from: string, to: string) {
    const newPair = {
      id: this.generateId(),
      from,
      to,
      amountFrom: "",
      amountTo: ""
    };
    this.currencyPairs.push(newPair);
    this.savePairs();
  }

  removePair(id: string) {
    this.currencyPairs = this.currencyPairs.filter(pair => pair.id !== id);
    this.savePairs();
  }

  updateAmount(pairId: string, value: string, isFrom: boolean) {
    const pair = this.currencyPairs.find(p => p.id === pairId);
    if (!pair || !this.rates) return;

    if (isFrom) {
      pair.amountFrom = value;
      pair.amountTo = this.convert(value, pair.from, pair.to);
    } else {
      pair.amountTo = value;
      pair.amountFrom = this.convert(value, pair.to, pair.from);
    }
  }

  convert(amount: string, from: string, to: string): string {
    if (!amount || isNaN(Number(amount)) || !this.rates) return "";
    
    const amountNum = parseFloat(amount);
    
    if (from === to) return amountNum.toString();
    
    if (from === "USD") {
      return (amountNum * (this.rates[to] || 1)).toFixed(4).replace(/\.?0+$/, "");
    } 
    if (to === "USD") {
      return (amountNum / (this.rates[from] || 1)).toFixed(4).replace(/\.?0+$/, "");
    } 
    
    const fromRate = this.rates[from];
    const toRate = this.rates[to];
    
    if (fromRate && toRate) {
      const usdAmount = amountNum / fromRate;
      return (usdAmount * toRate).toFixed(4).replace(/\.?0+$/, "");
    }
    
    return "";
  }

  recalculateAllPairs() {
    if (!this.rates) return;
    
    this.currencyPairs.forEach(pair => {
      if (pair.amountFrom) {
        pair.amountTo = this.convert(pair.amountFrom, pair.from, pair.to);
      } else if (pair.amountTo) {
        pair.amountFrom = this.convert(pair.amountTo, pair.to, pair.from);
      }
    });
  }
}

const currencyStore = new CurrencyStore();
export default currencyStore;