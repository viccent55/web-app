// src/bootstrap.ts

declare global {
  interface Window {
    API_ENDPOINT?: string;
  }
}
// 1. Read from query string (iframe injects ?api=...)
const params = new URLSearchParams(window.location.search);
const injectedApi = params.get("api");
// 2. Fallback to previous value (if user reloads without ?api=)
const storedApi = localStorage.getItem("API_ENDPOINT") || undefined;
// 3. Final API endpoint priority:
//    iframe (?api=) > localStorage > Vite env > empty
export const API_ENDPOINT =
  injectedApi ||
  storedApi ||
  import.meta.env.VITE_PROD_API_BASE ||
  "";
// 4. Persist + expose on window for debugging / other code
if (API_ENDPOINT) {
  window.API_ENDPOINT = API_ENDPOINT;
  localStorage.setItem("API_ENDPOINT", API_ENDPOINT);
  console.log("[BOOTSTRAP] API_ENDPOINT =", API_ENDPOINT);
}