import { state } from "./state.js";
import { V, esc, escAttr, today, fmtDate, fmtRupiah } from "./utils.js";
import { toast } from "./ui.js";
import { iconAlert16, iconSaveOk16, iconEditOk16, iconTrash16 } from "./icons.js";

let txListDelegationBound = false;

export function initTxListClickDelegation() {
  if (txListDelegationBound) return;
  const list = document.getElementById("tx-list");
  if (!list) return;
  txListDelegationBound = true;
  list.addEventListener("click", (e) => {
    const editBtn = e.target.closest("[data-tx-action='edit']");
    const delBtn = e.target.closest("[data-tx-action='delete']");
    if (editBtn) {
      const id = editBtn.getAttribute("data-tx-id");
      if (id) startEdit(id);
      return;
    }
    if (delBtn) {
      const id = delBtn.getAttribute("data-tx-id");
      if (id) askDel(id);
    }
  });
}

let transactionsValueListener = null;

function onTransactionsValue(snap) {
  state.allTx = snap.val() || {};
  renderTx();
  renderSummary();
}

function onTransactionsCancel(err) {
  if (!transactionsValueListener) return;
  const code = err && err.code;
  const msg = err && err.message ? String(err.message) : "";
  if (code === "PERMISSION_DENIED" || /permission/i.test(msg)) {
    toast("error", iconAlert16 + " Tidak ada izin membaca data. Periksa Realtime Database rules.", {
      html: true,
    });
    return;
  }
  if (/unsubscrib|cancel|closed|removed/i.test(msg)) return;
  console.error(err);
  toast("error", iconAlert16 + " Gagal membaca data.", { html: true });
}

export function attachDB(uid) {
  detachDB();
  state.rtdbRef = state.db.ref("users/" + uid + "/transactions");
  transactionsValueListener = onTransactionsValue;
  state.rtdbRef.on("value", transactionsValueListener, onTransactionsCancel);
}

export function detachDB() {
  if (state.rtdbRef && transactionsValueListener) {
    const fn = transactionsValueListener;
    transactionsValueListener = null;
    state.rtdbRef.off("value", fn);
  } else {
    transactionsValueListener = null;
  }
  state.rtdbRef = null;
  state.allTx = {};
}

export function txRef() {
  return state.db.ref("users/" + state.user.uid + "/transactions");
}

export function handleSubmit() {
  if (!state.user) return;
  const nominal = parseFloat(document.getElementById("field-nominal").value) || 0;
  const tipe = document.getElementById("field-tipe").value;
  const kategori = document.getElementById("field-kategori").value;
  const keterangan = V("field-keterangan");
  const tanggal = document.getElementById("field-tanggal").value;
  const editId = document.getElementById("edit-id").value;

  if (nominal <= 0)
    return toast("error", iconAlert16 + " Nominal harus lebih dari 0.", { html: true });
  if (!tanggal)
    return toast("error", iconAlert16 + " Tanggal harus diisi.", { html: true });

  const d = {
    nominal,
    tipe,
    kategori,
    keterangan,
    tanggal,
    updatedAt: new Date().toISOString(),
  };
  if (editId) {
    txRef()
      .child(editId)
      .update(d)
      .then(() => {
        toast("success", iconEditOk16 + " Transaksi diperbarui!", { html: true });
        cancelEdit();
      })
      .catch((e) =>
        toast("error", iconAlert16 + " " + esc(e.message), { html: true }),
      );
  } else {
    d.createdAt = new Date().toISOString();
    txRef()
      .push(d)
      .then(() => {
        toast("success", iconSaveOk16 + " Transaksi disimpan!", { html: true });
        clearForm();
      })
      .catch((e) =>
        toast("error", iconAlert16 + " " + esc(e.message), { html: true }),
      );
  }
}

export function askDel(id) {
  state.delTarget = id;
  const t = state.allTx[id];
  const keterangan = t ? (t.keterangan || t.kategori || "") : "";
  document.getElementById("del-modal-txt").textContent =
    '"' + (keterangan || "Transaksi ini") + '" akan dihapus permanen dari Firebase.';
  document.getElementById("del-overlay").classList.remove("hidden");
  document.getElementById("del-overlay").classList.add("grid");
}

export function confirmDel() {
  if (!state.delTarget) return;
  txRef()
    .child(state.delTarget)
    .remove()
    .then(() => {
      toast("info", iconTrash16 + " Transaksi dihapus.", { html: true });
      closeDelModal();
    })
    .catch((e) =>
      toast("error", iconAlert16 + " " + esc(e.message), { html: true }),
    );
}

export function closeDelModal(e) {
  if (e && e.target !== document.getElementById("del-overlay")) return;
  document.getElementById("del-overlay").classList.add("hidden");
  document.getElementById("del-overlay").classList.remove("grid");
  state.delTarget = null;
}

export function startEdit(id) {
  const t = state.allTx[id];
  if (!t) return;
  document.getElementById("edit-id").value = id;
  document.getElementById("field-nominal").value = t.nominal || 0;
  document.getElementById("field-tipe").value = t.tipe || "Pengeluaran";
  document.getElementById("field-kategori").value = t.kategori || "Lainnya";
  document.getElementById("field-keterangan").value = t.keterangan || "";
  document.getElementById("field-tanggal").value = t.tanggal || today();
  setTipe(t.tipe || "Pengeluaran");
  document.getElementById("form-title").textContent = "Edit Transaksi";
  document.getElementById("form-tag").textContent = "EDIT";
  document.getElementById("form-tag").classList.add("bg-amber-50", "text-amber-900", "border-amber-300");
  document.getElementById("form-tag").classList.remove("bg-emerald-50", "text-emerald-900", "border-emerald-300");
  document.getElementById("btn-icon").innerHTML =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-block align-middle" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>';
  document.getElementById("btn-text").textContent = "Perbarui Data";
  const bc = document.getElementById("btn-cancel");
  bc.classList.remove("hidden");
  bc.classList.add("flex");
  document.querySelector(".panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function cancelEdit() {
  clearForm();
  document.getElementById("edit-id").value = "";
  document.getElementById("form-title").textContent = "Tambah Transaksi";
  document.getElementById("form-tag").textContent = "BARU";
  document.getElementById("form-tag").classList.remove("bg-amber-50", "text-amber-900", "border-amber-300");
  document.getElementById("form-tag").classList.add("bg-emerald-50", "text-emerald-900", "border-emerald-300");
  document.getElementById("btn-icon").innerHTML =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-block align-middle" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>';
  document.getElementById("btn-text").textContent = "Simpan ke Firebase";
  const bc = document.getElementById("btn-cancel");
  bc.classList.add("hidden");
  bc.classList.remove("flex");
}

export function clearForm() {
  document.getElementById("field-nominal").value = "";
  document.getElementById("field-keterangan").value = "";
  document.getElementById("field-tanggal").value = today();
  setTipe("Pengeluaran");
  document.getElementById("field-kategori").value = "Makanan & Minuman";
}

const incomeOn =
  "border-emerald-800 bg-emerald-50 text-emerald-900 shadow-sm ring-1 ring-emerald-200";
const incomeOff =
  "border-neutral-200 bg-transparent text-neutral-600 hover:border-neutral-400";
const expenseOn =
  "border-red-800 bg-red-50 text-red-900 shadow-sm ring-1 ring-red-200";
const expenseOff =
  "border-neutral-200 bg-transparent text-neutral-600 hover:border-neutral-400";

export function setTipe(t) {
  document.getElementById("field-tipe").value = t;
  const inc = document.getElementById("btn-income");
  const exp = document.getElementById("btn-expense");
  if (t === "Pemasukan") {
    inc.className =
      "tipe-btn flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition " + incomeOn;
    exp.className =
      "tipe-btn flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition " + expenseOff;
  } else {
    exp.className =
      "tipe-btn flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition " + expenseOn;
    inc.className =
      "tipe-btn flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition " + incomeOff;
  }
}

export function renderTx() {
  const list = document.getElementById("tx-list");
  const search = V("search-in").toLowerCase();
  const fT = document.getElementById("fil-tipe").value;
  const fK = document.getElementById("fil-kat").value;

  const entries = Object.entries(state.allTx)
    .filter(([, t]) => {
      return (
        (!search ||
          (t.keterangan || "").toLowerCase().includes(search) ||
          (t.kategori || "").toLowerCase().includes(search)) &&
        (!fT || t.tipe === fT) &&
        (!fK || t.kategori === fK)
      );
    })
    .sort(([, a], [, b]) => (a.tanggal < b.tanggal ? 1 : -1));

  document.getElementById("tx-count").textContent =
    entries.length + " transaksi" + (search || fT || fK ? " (difilter)" : "");

  if (!entries.length) {
    list.innerHTML =
      Object.keys(state.allTx).length === 0
        ? `<div class="py-12 px-4 text-center text-neutral-600"><div class="mb-2 text-4xl opacity-80" aria-hidden="true"><svg class="mx-auto" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8m-5-6h6m-6 4h6m6-10v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2z"/></svg></div><div class="font-bold text-neutral-900">Belum ada transaksi</div><p class="mt-1 text-sm">Tambahkan transaksi pertamamu di form sebelah kiri</p></div>`
        : `<div class="py-12 px-4 text-center text-neutral-600"><div class="mb-2" aria-hidden="true"><svg class="mx-auto opacity-80" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div><div class="font-bold text-neutral-900">Tidak ada hasil</div><p class="mt-1 text-sm">Coba ubah kata kunci atau filter</p></div>`;
    return;
  }

  const catIcon = {
    "Makanan & Minuman": "🍽",
    Transportasi: "🚙",
    Belanja: "🛒",
    Hiburan: "🎯",
    Kesehatan: "💉",
    Pendidikan: "📖",
    Tagihan: "📄",
    Gaji: "💵",
    Freelance: "💻",
    Investasi: "📈",
    Hadiah: "🎀",
    Lainnya: "📌",
  };

  list.innerHTML = entries
    .map(([id, t]) => {
      const isIn = t.tipe === "Pemasukan";
      const icon = catIcon[t.kategori] || "\u{1F4CC}";
      const label = esc(t.keterangan || t.kategori);
      const idAttr = escAttr(id);
      return `<div class="flex items-center gap-3.5 rounded-xl border border-neutral-200 bg-neutral-50 px-5 py-4 transition hover:border-neutral-400 hover:shadow-md">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl shadow-sm ${isIn ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-900"}">${icon}</div>
        <div class="min-w-0 flex-1">
          <div class="truncate font-semibold text-neutral-900">${label}</div>
          <div class="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-neutral-600">
            <span class="rounded-full border px-2 py-0.5 font-semibold uppercase tracking-wide ${isIn ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-900"}">${esc(t.kategori)}</span>
            <span class="inline-flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>${fmtDate(t.tanggal)}</span>
          </div>
        </div>
        <div class="shrink-0 text-right font-bold tabular-nums ${isIn ? "text-emerald-800" : "text-red-900"}"><span class="text-sm">${isIn ? "+" : "−"}</span>${fmtRupiah(t.nominal)}</div>
        <div class="flex shrink-0 gap-1">
          <button type="button" data-tx-action="edit" data-tx-id="${idAttr}" class="icon-btn grid h-8 w-8 place-items-center rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:border-emerald-700 hover:text-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700" title="Edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
          <button type="button" data-tx-action="delete" data-tx-id="${idAttr}" class="icon-btn grid h-8 w-8 place-items-center rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:border-red-800 hover:text-red-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700" title="Hapus"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg></button>
        </div>
      </div>`;
    })
    .join("");
}

export function renderSummary() {
  const arr = Object.values(state.allTx);
  const income = arr.filter((t) => t.tipe === "Pemasukan");
  const expense = arr.filter((t) => t.tipe === "Pengeluaran");
  const totalIn = income.reduce((s, t) => s + (+t.nominal || 0), 0);
  const totalEx = expense.reduce((s, t) => s + (+t.nominal || 0), 0);
  const bal = totalIn - totalEx;
  document.getElementById("sum-balance").textContent =
    (bal < 0 ? "−" : "") + "Rp " + fmtRupiah(Math.abs(bal));
  document.getElementById("sum-income").textContent = "Rp " + fmtRupiah(totalIn);
  document.getElementById("sum-expense").textContent = "Rp " + fmtRupiah(totalEx);
  document.getElementById("sum-tx-count").textContent = arr.length + " transaksi";
  document.getElementById("sum-income-count").textContent = income.length + " transaksi";
  document.getElementById("sum-expense-count").textContent = expense.length + " transaksi";
}
