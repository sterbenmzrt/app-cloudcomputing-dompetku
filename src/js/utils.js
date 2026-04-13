export function V(id) {
  return document.getElementById(id).value.trim();
}

export function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function escAttr(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;");
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function fmtDate(d) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return (
    parseInt(day, 10) +
    " " +
    ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"][m - 1] +
    " " +
    y
  );
}

export function fmtRupiah(n) {
  return Math.abs(+n || 0).toLocaleString("id-ID");
}
