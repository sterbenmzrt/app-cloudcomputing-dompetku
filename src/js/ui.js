import { iconAlert16 } from "./icons.js";
import { esc } from "./utils.js";

export function showErr(m) {
  const e = document.getElementById("auth-error");
  e.innerHTML = iconAlert16 + esc(m);
  e.classList.remove("hidden");
  e.classList.add("flex");
}

export function clearErr() {
  const e = document.getElementById("auth-error");
  e.classList.add("hidden");
  e.classList.remove("flex");
}

export function showInfo(m, opts) {
  const e = document.getElementById("auth-info");
  if (opts?.html) e.innerHTML = m;
  else e.textContent = m;
  e.classList.remove("hidden");
  e.classList.add("flex");
}

export function clearInfo() {
  const e = document.getElementById("auth-info");
  e.classList.add("hidden");
  e.classList.remove("flex");
}

export function busy(btnId, spinId, on) {
  document.getElementById(btnId).disabled = on;
  document.getElementById(spinId).classList.toggle("hidden", !on);
}

export function toast(type, msg, opts) {
  opts = opts || {};
  const c = document.getElementById("toast-wrap");
  const el = document.createElement("div");
  const base =
    "flex items-start gap-2.5 rounded-xl border bg-white px-4 py-3.5 text-sm font-medium leading-snug shadow-lg max-w-[min(28rem,calc(100vw-1.5rem))] pointer-events-auto text-neutral-900 border-neutral-200";
  const accent =
    type === "success"
      ? " border-l-4 border-l-emerald-700"
      : type === "error"
        ? " border-l-4 border-l-red-800"
        : " border-l-4 border-l-neutral-900";
  el.className = base + accent;
  el.setAttribute("role", type === "error" ? "alert" : "status");
  el.setAttribute("aria-live", type === "error" ? "assertive" : "polite");
  if (opts.html) el.innerHTML = msg;
  else el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}
