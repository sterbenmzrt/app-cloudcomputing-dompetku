import { state } from "./state.js";
import { attachDB, detachDB, setTipe } from "./transactions.js";
import { today } from "./utils.js";

export function hideLoader() {
  document.getElementById("app-loading").classList.add("opacity-0", "pointer-events-none");
}

export function showAuth() {
  document.getElementById("auth-screen").classList.remove("hidden");
  document.getElementById("app-screen").classList.add("hidden");
}

export function showMain(u) {
  state.user = u;
  document.getElementById("auth-screen").classList.add("hidden");
  document.getElementById("app-screen").classList.remove("hidden");
  document.getElementById("user-av").textContent = (u.displayName || u.email || "?")[0].toUpperCase();
  document.getElementById("user-name").textContent = u.displayName || u.email;
  document.getElementById("field-tanggal").value = today();
  setTipe(document.getElementById("field-tipe").value || "Pengeluaran");
  attachDB(u.uid);
}

export function clearSession() {
  state.user = null;
  detachDB();
}

