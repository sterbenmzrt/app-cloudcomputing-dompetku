import { state } from "./state.js";
import { showErr } from "./ui.js";
import { hideLoader, showAuth } from "./navigation.js";
import { initAuthListeners, handleEmailAction } from "./auth.js";

export function initApp() {
  try {
    if (typeof firebaseConfig === "undefined") {
      hideLoader();
      showAuth();
      const w0 = document.getElementById("cfg-warn");
      w0.classList.remove("hidden");
      w0.classList.add("flex");
      return;
    }

    if (
      firebaseConfig.apiKey === "ISI_API_KEY_KAMU" ||
      firebaseConfig.authDomain === "nama-project-kamu.firebaseapp.com" ||
      firebaseConfig.databaseURL ===
        "https://nama-project-kamu-default-rtdb.asia-southeast1.firebasedatabase.app"
    ) {
      hideLoader();
      showAuth();
      const w = document.getElementById("cfg-warn");
      w.classList.remove("hidden");
      w.classList.add("flex");
      return;
    }

    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    state.db = firebase.database();
    state.auth = firebase.auth();

    initAuthListeners();
    handleEmailAction();
  } catch (e) {
    hideLoader();
    showAuth();
    showErr("Init gagal: " + e.message);
  }
}
