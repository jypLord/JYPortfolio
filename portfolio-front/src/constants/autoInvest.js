export const API_BASE_URL = (import.meta.env.VITE_AUTO_INVEST_API_BASE_URL ?? "").trim();
export const API_CHART_PATH = (import.meta.env.VITE_AUTO_INVEST_CHART_PATH ?? "/chart").trim();
export const API_SAVE_PATH = (import.meta.env.VITE_AUTO_INVEST_SAVE_PATH ?? "/watchlist").trim();

export const HAS_API_CONFIG = API_BASE_URL.length > 0;
export const MAX_WATCH_ITEMS = 10;
