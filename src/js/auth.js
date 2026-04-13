import { state } from "./state.js";
import { V, esc } from "./utils.js";
import { showErr, clearErr, showInfo, clearInfo, toast, busy } from "./ui.js";
import { iconSuccess16, iconLogout16 } from "./icons.js";
import { hideLoader, showAuth, showMain, clearSession } from "./navigation.js";

const tabOn =
  "flex-1 rounded-lg py-3 text-sm font-semibold transition bg-neutral-900 text-white shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const tabOff =
  "flex-1 rounded-lg py-3 text-sm font-semibold transition text-neutral-600 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";

export function switchTab(t) {
  const l = t === "login";
  document.getElementById("tab-login").className = l ? tabOn : tabOff;
  document.getElementById("tab-register").className = l ? tabOff : tabOn;
  document.getElementById("form-login").classList.toggle("hidden", !l);
  document.getElementById("form-register").classList.toggle("hidden", l);
  clearErr();
  clearInfo();
}

export async function doRegister() {
  const name = V("reg-name"),
    email = V("reg-email"),
    pw1 = V("reg-pw"),
    pw2 = V("reg-pw2");
  clearErr();
  clearInfo();
  if (!name) return showErr("Nama lengkap harus diisi.");
  if (!email) return showErr("Email harus diisi.");
  if (pw1.length < 6) return showErr("Password minimal 6 karakter.");
  if (pw1 !== pw2) return showErr("Konfirmasi password tidak cocok.");
  busy("btn-reg", "reg-spin", true);
  try {
    state.skipRedirect = true;
    const c = await state.auth.createUserWithEmailAndPassword(email, pw1);
    await c.user.updateProfile({ displayName: name });
    try {
      await c.user.sendEmailVerification({
        url: window.location.origin + window.location.pathname,
      });
    } catch {
      await c.user.sendEmailVerification();
    }
    await state.auth.signOut();
    state.skipRedirect = false;
    switchTab("login");
    showInfo(
      iconSuccess16 +
        " Akun berhasil dibuat! Link verifikasi dikirim ke " +
        esc(email) +
        ". Cek inbox kamu.",
      { html: true },
    );
  } catch (e) {
    state.skipRedirect = false;
    showErr(errMsg(e.code));
  }
  busy("btn-reg", "reg-spin", false);
}

export async function doLogin() {
  const email = V("login-email"),
    pw = V("login-pw");
  clearErr();
  clearInfo();
  if (!email) return showErr("Email harus diisi.");
  if (!pw) return showErr("Password harus diisi.");
  busy("btn-login", "login-spin", true);
  try {
    const r = await state.auth.signInWithEmailAndPassword(email, pw);
    if (!r.user.emailVerified) {
      try {
        await r.user.sendEmailVerification({
          url: window.location.origin + window.location.pathname,
        });
      } catch {
        try {
          await r.user.sendEmailVerification();
        } catch {}
      }
      await state.auth.signOut();
      showErr("Email belum diverifikasi. Link baru dikirim ke " + email + ".");
      busy("btn-login", "login-spin", false);
      return;
    }
    toast("success", iconSuccess16 + " Berhasil masuk!", { html: true });
  } catch (e) {
    showErr(errMsg(e.code));
  }
  busy("btn-login", "login-spin", false);
}

export async function doGoogle() {
  clearErr();
  const pv = new firebase.auth.GoogleAuthProvider();
  try {
    await state.auth.signInWithPopup(pv);
    toast("success", iconSuccess16 + " Berhasil masuk dengan Google!", { html: true });
  } catch (e) {
    if (
      e.code === "auth/operation-not-supported-in-this-environment" ||
      e.code === "auth/popup-blocked"
    ) {
      try {
        await state.auth.signInWithRedirect(pv);
      } catch (r) {
        showErr(errMsg(r.code));
      }
    } else if (e.code !== "auth/popup-closed-by-user") {
      showErr(errMsg(e.code));
    }
  }
}

export async function doForgot() {
  const email = V("login-email");
  if (!email) return showErr("Masukkan email kamu terlebih dahulu.");
  try {
    await state.auth.sendPasswordResetEmail(email);
    toast("info", "Link reset dikirim ke " + email);
  } catch (e) {
    showErr(errMsg(e.code));
  }
}

export async function doLogout() {
  await state.auth.signOut();
  toast("info", iconLogout16 + " Berhasil keluar.", { html: true });
}

export function errMsg(c) {
  const map = {
    "auth/email-already-in-use": "Email sudah digunakan akun lain.",
    "auth/invalid-email": "Format email tidak valid.",
    "auth/weak-password": "Password terlalu lemah (min. 6 karakter).",
    "auth/user-not-found": "Akun tidak ditemukan.",
    "auth/wrong-password": "Password yang kamu masukkan salah.",
    "auth/invalid-credential": "Email atau password salah.",
    "auth/too-many-requests": "Terlalu banyak percobaan. Coba lagi nanti.",
    "auth/network-request-failed": "Koneksi gagal. Periksa internet.",
    "auth/user-disabled": "Akun ini telah dinonaktifkan.",
    "auth/popup-blocked": "Pop-up diblokir browser.",
    "auth/unauthorized-domain":
      "Domain ini belum diizinkan di Firebase. Tambahkan di Authorized Domains.",
  };
  if (c && map[c]) return map[c];
  if (c) return "Terjadi kesalahan (" + String(c) + "). Coba lagi.";
  return "Terjadi kesalahan. Coba lagi.";
}

export async function handleEmailAction() {
  const p = new URLSearchParams(window.location.search);
  const mode = p.get("mode"),
    oob = p.get("oobCode");
  if (mode === "verifyEmail" && oob) {
    try {
      await state.auth.applyActionCode(oob);
      switchTab("login");
      showInfo(
        iconSuccess16 + " Email berhasil diverifikasi! Silakan login.",
        { html: true },
      );
      window.history.replaceState({}, "", window.location.pathname);
    } catch {
      showErr("Verifikasi gagal: link tidak valid atau kedaluwarsa.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }
}

export function initAuthListeners() {
  state.auth.getRedirectResult().then((r) => {
    if (r && r.user)
      toast("success", iconSuccess16 + " Berhasil masuk dengan Google!", { html: true });
  }).catch((e) => {
    if (e.code && e.code !== "auth/popup-closed-by-user") showErr(errMsg(e.code));
  });

  state.auth.onAuthStateChanged((u) => {
    hideLoader();
    if (u) {
      if (state.skipRedirect) return;
      if (!u.emailVerified && u.providerData.some((p) => p.providerId === "password")) {
        state.auth.signOut();
        showAuth();
        return;
      }
      showMain(u);
    } else {
      clearSession();
      showAuth();
    }
  });
}
