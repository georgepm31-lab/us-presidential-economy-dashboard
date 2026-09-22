// client/src/services/api.js
const API_URL = '/api';

export const fetchPresidents = async () => {
  const response = await fetch(`${API_URL}/presidents`);
  return response.json();
};

export const fetchHistoricalMetrics = async () => {
  const response = await fetch(`${API_URL}/metrics/historical`);
  return response.json();
};

export const fetchPresidentSummary = async (presidentName) => {
  const response = await fetch(`${API_URL}/metrics/summary/${encodeURIComponent(presidentName)}`);
  return response.json();
};