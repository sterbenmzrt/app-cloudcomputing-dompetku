export function togglePw(id, btn) {
  const el = document.getElementById(id);
  const show = el.type === "password";
  el.type = show ? "text" : "password";
  btn.innerHTML = show
    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 0 5.06 5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 0-2.16 3.19m-6.72-1.07a3 3 0 1 1-2.12-2.12c-.59.59-.59 1.54 0 2.12l2.12 2.12z"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
}

export function checkPw(pw) {
  document.getElementById("pw-rules").classList.remove("hidden");
  const l = pw.length >= 6,
    u = /[A-Z]/.test(pw),
    n = /[0-9]/.test(pw);
  setR("r-len", l);
  setR("r-up", u);
  setR("r-num", n);
  const s = [l, u, n].filter(Boolean).length;
  const f = document.getElementById("str-fill");
  f.style.width = ["0%", "33%", "66%", "100%"][s];
  f.style.background = ["", "#2a5f7a", "#2a5f7a", "#1a3a52"][s];
}

function setR(id, ok) {
  document.getElementById(id).classList.toggle("ok", ok);
}
