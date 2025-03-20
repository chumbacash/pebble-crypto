const API_BASE_URL = 'https://api-crypto.coolifyapp.com';

export async function fetchSymbols() {
  const response = await fetch(`${API_BASE_URL}/symbols`);
  const data = await response.json();
  return data.symbols;
}

export async function fetchIntraday(symbol: string, interval: string = '1h') {
  const response = await fetch(`${API_BASE_URL}/intraday/${symbol}?interval=${interval}`);
  const data = await response.json();
  return data;
}

export async function fetchPrediction(symbol: string, interval: string = '1h') {
  const response = await fetch(`${API_BASE_URL}/predict/${symbol}?interval=${interval}`);
  const data = await response.json();
  return data;
}