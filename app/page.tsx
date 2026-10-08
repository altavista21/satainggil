"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowRightLeft,
  ArrowUpFromLine,
  BarChart3,
  Boxes,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Download,
  Edit3,
  FileText,
  Filter,
  Home,
  LogOut,
  Menu,
  PackageCheck,
  PackageOpen,
  PackagePlus,
  PackageMinus,
  Plus,
  RefreshCcw,
  RotateCcw,
  Save,
  Search,
  Settings,
  Trash2,
  Truck,
  Warehouse,
  X,
} from "lucide-react";

type Module =
  | "Dashboard"
  | "Stok"
  | "Barang"
  | "Barang Masuk"
  | "Barang Keluar"
  | "Mutasi"
  | "Laporan"
  | "Pengaturan";

type Product = {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: "kg" | "bal";
  minStock: number;
};

type WarehouseItem = {
  id: string;
  name: string;
  location: string;
};

type Stock = {
  productId: string;
  warehouseId: string;
  quantity: number;
};

type TransactionType = "MASUK" | "KELUAR" | "MUTASI";

type Transaction = {
  id: string;
  type: TransactionType;
  date: string;
  productId: string;
  fromWarehouseId: string | null;
  toWarehouseId: string | null;
  quantity: number;
  reference: string;
  note: string;
};

const menu: { label: Module; icon: LucideIcon }[] = [
  { label: "Dashboard", icon: Home },
  { label: "Stok", icon: Boxes },
  { label: "Barang", icon: PackageOpen },
  { label: "Barang Masuk", icon: PackageCheck },
  { label: "Barang Keluar", icon: Truck },
  { label: "Mutasi", icon: ClipboardList },
  { label: "Laporan", icon: BarChart3 },
];

const initialProducts: Product[] = [
  { id: "prd-001", code: "TMK-RJG-01", name: "Tembakau Rajangan", category: "Rajangan", unit: "kg", minStock: 500 },
  { id: "prd-002", code: "TMK-HRJ-01", name: "Tembakau Hitam Rajangan", category: "Rajangan", unit: "kg", minStock: 300 },
  { id: "prd-003", code: "TMK-KRS-01", name: "Tembakau Krosok", category: "Krosok", unit: "kg", minStock: 250 },
  { id: "prd-004", code: "TMK-PRM-01", name: "Tembakau Premium", category: "Premium", unit: "kg", minStock: 400 },
];

const initialWarehouses: WarehouseItem[] = [
  { id: "wh-a", name: "Gudang A", location: "Penyimpanan Utama" },
  { id: "wh-b", name: "Gudang B", location: "Penyimpanan Produksi" },
];

const initialStocks: Stock[] = [
  { productId: "prd-001", warehouseId: "wh-a", quantity: 4300 },
  { productId: "prd-001", warehouseId: "wh-b", quantity: 1200 },
  { productId: "prd-002", warehouseId: "wh-a", quantity: 2600 },
  { productId: "prd-002", warehouseId: "wh-b", quantity: 700 },
  { productId: "prd-003", warehouseId: "wh-a", quantity: 1450 },
  { productId: "prd-003", warehouseId: "wh-b", quantity: 680 },
  { productId: "prd-004", warehouseId: "wh-a", quantity: 950 },
  { productId: "prd-004", warehouseId: "wh-b", quantity: 600 },
];

const initialTransactions: Transaction[] = [
  { id: "trx-001", type: "MASUK", date: "2026-10-08", productId: "prd-001", fromWarehouseId: null, toWarehouseId: "wh-a", quantity: 2450, reference: "IN-20261008-001", note: "Penerimaan tembakau rajangan" },
  { id: "trx-002", type: "MUTASI", date: "2026-10-08", productId: "prd-002", fromWarehouseId: "wh-a", toWarehouseId: "wh-b", quantity: 780, reference: "MT-20261008-001", note: "Pemindahan stok" },
  { id: "trx-003", type: "KELUAR", date: "2026-10-07", productId: "prd-004", fromWarehouseId: "wh-b", toWarehouseId: null, quantity: 1120, reference: "OUT-20261007-001", note: "Pengeluaran produksi" },
  { id: "trx-004", type: "KELUAR", date: "2026-10-07", productId: "prd-001", fromWarehouseId: "wh-a", toWarehouseId: null, quantity: 320, reference: "OUT-20261007-002", note: "Quality check" },
];

const descriptions: Record<Module, string> = {
  Dashboard: "Ringkasan kondisi stok dan aktivitas gudang.",
  Stok: "Pantau jumlah stok tembakau berdasarkan gudang dan jenisnya.",
  Barang: "Kelola master jenis tembakau yang digunakan dalam transaksi.",
  "Barang Masuk": "Catat penerimaan tembakau dari pemasok atau sumber lain.",
  "Barang Keluar": "Catat pengeluaran tembakau untuk produksi atau kebutuhan lain.",
  Mutasi: "Catat perpindahan stok antar gudang.",
  Laporan: "Filter transaksi dan ekspor data untuk kebutuhan pelaporan.",
  Pengaturan: "Kelola gudang, preferensi sistem, dan data demo.",
};

const today = () => new Date().toISOString().slice(0, 10);
const formatKg = (n: number) => new Intl.NumberFormat("id-ID").format(n) + " kg";
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(value + "T00:00:00"),
  );

function uid(prefix: string) {
  return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) => row.map((cell) => '"' + String(cell).replaceAll('"', '""') + '"').join(","))
    .join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function Page() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Module>("Dashboard");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>(initialWarehouses);
  const [stocks, setStocks] = useState<Stock[]>(initialStocks);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [transactionFilter, setTransactionFilter] = useState<TransactionType | "all">("all");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showTransactionForm, setShowTransactionForm] = useState<TransactionType | null>(null);
  const [showWarehouseForm, setShowWarehouseForm] = useState(false);

  useEffect(() => {
    setProducts(readStorage("sata-products", initialProducts));
    setWarehouses(readStorage("sata-warehouses", initialWarehouses));
    setStocks(readStorage("sata-stocks", initialStocks));
    setTransactions(readStorage("sata-transactions", initialTransactions));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("sata-products", JSON.stringify(products));
    localStorage.setItem("sata-warehouses", JSON.stringify(warehouses));
    localStorage.setItem("sata-stocks", JSON.stringify(stocks));
    localStorage.setItem("sata-transactions", JSON.stringify(transactions));
  }, [hydrated, products, warehouses, stocks, transactions]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const warehouseMap = useMemo(() => new Map(warehouses.map((w) => [w.id, w])), [warehouses]);

  const totalStock = useMemo(() => stocks.reduce((sum, item) => sum + item.quantity, 0), [stocks]);
  const monthKey = "2026-10";
  const incomingThisMonth = useMemo(
    () => transactions.filter((t) => t.type === "MASUK" && t.date.startsWith(monthKey)).reduce((s, t) => s + t.quantity, 0),
    [transactions],
  );
  const outgoingThisMonth = useMemo(
    () => transactions.filter((t) => t.type === "KELUAR" && t.date.startsWith(monthKey)).reduce((s, t) => s + t.quantity, 0),
    [transactions],
  );

  const filteredStocks = useMemo(() => {
    const q = search.toLowerCase().trim();
    return stocks.filter((item) => {
      const product = productMap.get(item.productId);
      const warehouse = warehouseMap.get(item.warehouseId);
      if (!product || !warehouse) return false;
      const matchesSearch = !q || product.name.toLowerCase().includes(q) || product.code.toLowerCase().includes(q);
      const matchesWarehouse = warehouseFilter === "all" || item.warehouseId === warehouseFilter;
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      return matchesSearch && matchesWarehouse && matchesCategory;
    });
  }, [stocks, productMap, warehouseMap, search, warehouseFilter, categoryFilter]);

  const filteredTransactions = useMemo(() => {
    const q = search.toLowerCase().trim();
    return transactions
      .filter((t) => {
        const product = productMap.get(t.productId);
        const from = t.fromWarehouseId ? warehouseMap.get(t.fromWarehouseId) : null;
        const to = t.toWarehouseId ? warehouseMap.get(t.toWarehouseId) : null;
        const matchesSearch =
          !q ||
          product?.name.toLowerCase().includes(q) ||
          product?.code.toLowerCase().includes(q) ||
          t.reference.toLowerCase().includes(q) ||
          t.note.toLowerCase().includes(q);
        const matchesType = transactionFilter === "all" || t.type === transactionFilter;
        const matchesFrom = !dateFrom || t.date >= dateFrom;
        const matchesTo = !dateTo || t.date <= dateTo;
        const matchesWarehouse =
          warehouseFilter === "all" ||
          t.fromWarehouseId === warehouseFilter ||
          t.toWarehouseId === warehouseFilter;
        void from;
        void to;
        return matchesSearch && matchesType && matchesFrom && matchesTo && matchesWarehouse;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, productMap, warehouseMap, search, transactionFilter, dateFrom, dateTo, warehouseFilter]);

  const lowStock = useMemo(
    () =>
      stocks.filter((item) => {
        const product = productMap.get(item.productId);
        return product && item.quantity <= product.minStock;
      }),
    [stocks, productMap],
  );

  const selectMenu = (label: Module) => {
    setActive(label);
    setOpen(false);
    setSearch("");
    setNotice("");
  };

  const adjustStock = (productId: string, warehouseId: string, delta: number) => {
    setStocks((current) =>
      current.map((item) =>
        item.productId === productId && item.warehouseId === warehouseId
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item,
      ),
    );
  };

  const saveProduct = (product: Product) => {
    if (editingProduct) {
      setProducts((current) => current.map((item) => (item.id === product.id ? product : item)));
      setNotice("Data barang berhasil diperbarui.");
    } else {
      setProducts((current) => [...current, product]);
      setStocks((current) => [
        ...current,
        ...warehouses.map((warehouse) => ({ productId: product.id, warehouseId: warehouse.id, quantity: 0 })),
      ]);
      setNotice("Barang baru berhasil ditambahkan.");
    }
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const deleteProduct = (id: string) => {
    const used = transactions.some((t) => t.productId === id);
    if (used) {
      setNotice("Barang tidak bisa dihapus karena sudah dipakai dalam transaksi.");
      return;
    }
    setProducts((current) => current.filter((item) => item.id !== id));
    setStocks((current) => current.filter((item) => item.productId !== id));
    setNotice("Barang berhasil dihapus.");
  };

  const saveTransaction = (transaction: Transaction) => {
    const source = transaction.fromWarehouseId;
    const destination = transaction.toWarehouseId;
    if (transaction.quantity <= 0) {
      setNotice("Jumlah transaksi harus lebih dari 0.");
      return;
    }
    if ((transaction.type === "KELUAR" || transaction.type === "MUTASI") && source) {
      const sourceStock = stocks.find((s) => s.productId === transaction.productId && s.warehouseId === source)?.quantity ?? 0;
      if (sourceStock < transaction.quantity) {
        setNotice("Stok gudang asal tidak mencukupi.");
        return;
      }
    }
    if (transaction.type === "MASUK" && destination) adjustStock(transaction.productId, destination, transaction.quantity);
    if (transaction.type === "KELUAR" && source) adjustStock(transaction.productId, source, -transaction.quantity);
    if (transaction.type === "MUTASI" && source && destination) {
      adjustStock(transaction.productId, source, -transaction.quantity);
      adjustStock(transaction.productId, destination, transaction.quantity);
    }
    setTransactions((current) => [transaction, ...current]);
    setShowTransactionForm(null);
    setNotice("Transaksi " + transaction.type.toLowerCase() + " berhasil disimpan.");
  };

  const addWarehouse = (name: string, location: string) => {
    const warehouse: WarehouseItem = { id: uid("wh"), name, location };
    setWarehouses((current) => [...current, warehouse]);
    setStocks((current) => [
      ...current,
      ...products.map((product) => ({ productId: product.id, warehouseId: warehouse.id, quantity: 0 })),
    ]);
    setShowWarehouseForm(false);
    setNotice("Gudang berhasil ditambahkan.");
  };

  const resetDemo = () => {
    setProducts(initialProducts);
    setWarehouses(initialWarehouses);
    setStocks(initialStocks);
    setTransactions(initialTransactions);
    setNotice("Data demo berhasil dikembalikan ke kondisi awal.");
  };

  const exportTransactions = () => {
    downloadCsv("sata-inggil-laporan.csv", [
      ["Tanggal", "Tipe", "Referensi", "Barang", "Dari", "Ke", "Jumlah", "Catatan"],
      ...filteredTransactions.map((t) => [
        t.date,
        t.type,
        t.reference,
        productMap.get(t.productId)?.name ?? "-",
        t.fromWarehouseId ? warehouseMap.get(t.fromWarehouseId)?.name ?? "-" : "-",
        t.toWarehouseId ? warehouseMap.get(t.toWarehouseId)?.name ?? "-" : "-",
        String(t.quantity),
        t.note,
      ]),
    ]);
    setNotice("Laporan CSV berhasil dibuat.");
  };

  const ActiveIcon = menu.find((item) => item.label === active)?.icon ?? Settings;

  return (
    <div className="min-h-screen bg-[#F5F7F3] text-[#19352B]">
      <aside className={"fixed inset-y-0 left-0 z-40 w-72 bg-[#123B2E] text-white transition-transform lg:translate-x-0 " + (open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div>
            <div className="text-xl font-extrabold tracking-tight">SATA ING<mark className="rounded bg-[#F4C542] px-1 text-[#123B2E]">G</mark>IL</div>
            <div className="text-xs text-white/55">Warehouse Management</div>
          </div>
          <button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-white/10 lg:hidden" aria-label="Tutup menu"><X size={20} /></button>
        </div>
        <nav className="space-y-1 p-4">
          {menu.map(({ label, icon: Icon }) => (
            <button key={label} onClick={() => selectMenu(label)} className={"flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition " + (active === label ? "bg-[#F4C542] text-[#123B2E] shadow-lg shadow-black/10" : "text-white/70 hover:bg-white/10 hover:text-white")}>
              <Icon size={19} />{label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-4">
          <button onClick={() => selectMenu("Pengaturan")} className={"flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm " + (active === "Pengaturan" ? "bg-[#F4C542] text-[#123B2E] font-bold" : "text-white/65 hover:bg-white/10 hover:text-white")}><Settings size={18} />Pengaturan</button>
          <button onClick={() => setNotice("Belum ada autentikasi pada versi ini. Tidak ada sesi login yang bisa diakhiri.")} className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/65 hover:bg-white/10 hover:text-white"><LogOut size={18} />Keluar</button>
        </div>
      </aside>

      {open && <button aria-label="Tutup navigasi" onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-black/40 lg:hidden" />}

      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#DCE5DF] bg-[#F5F7F3]/95 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="rounded-xl bg-white p-2.5 shadow-sm lg:hidden" aria-label="Buka menu"><Menu size={21} /></button>
            <div><p className="text-sm text-[#718078]">Sata Inggil WMS</p><h1 className="text-lg font-bold md:text-xl">{active}</h1></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block"><p className="text-sm font-bold">Operator Gudang</p><p className="text-xs text-[#718078]">Mode lokal</p></div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#F4C542] font-extrabold text-[#123B2E]">SI</div>
          </div>
        </header>

        {notice && (
          <div className="fixed right-4 top-24 z-50 flex max-w-sm items-center gap-3 rounded-xl border border-[#C9D9C5] bg-white px-4 py-3 text-sm font-semibold shadow-xl">
            <CheckCircle2 size={18} className="text-[#3D6B32]" />{notice}
            <button onClick={() => setNotice("")} aria-label="Tutup notifikasi"><X size={16} /></button>
          </div>
        )}

        <div className="mx-auto max-w-7xl p-4 md:p-8">
          {active === "Dashboard" && (
            <Dashboard
              totalStock={totalStock}
              incoming={incomingThisMonth}
              outgoing={outgoingThisMonth}
              productCount={products.length}
              transactionCount={transactions.length}
              lowStock={lowStock}
              products={productMap}
              warehouses={warehouseMap}
              transactions={transactions}
              onNavigate={selectMenu}
            />
          )}

          {active === "Stok" && (
            <StockModule
              stocks={filteredStocks}
              products={productMap}
              warehouses={warehouseMap}
              search={search}
              setSearch={setSearch}
              warehouseFilter={warehouseFilter}
              setWarehouseFilter={setWarehouseFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              categories={[...new Set(products.map((p) => p.category))]}
              lowStock={lowStock}
            />
          )}

          {active === "Barang" && (
            <ProductsModule
              products={products}
              search={search}
              setSearch={setSearch}
              onAdd={() => { setEditingProduct(null); setShowProductForm(true); }}
              onEdit={(product) => { setEditingProduct(product); setShowProductForm(true); }}
              onDelete={deleteProduct}
            />
          )}

          {active === "Barang Masuk" && (
            <TransactionModule
              title="Barang Masuk"
              type="MASUK"
              transactions={filteredTransactions.filter((t) => t.type === "MASUK")}
              products={productMap}
              warehouses={warehouseMap}
              onAdd={() => setShowTransactionForm("MASUK")}
              onExport={exportTransactions}
            />
          )}

          {active === "Barang Keluar" && (
            <TransactionModule
              title="Barang Keluar"
              type="KELUAR"
              transactions={filteredTransactions.filter((t) => t.type === "KELUAR")}
              products={productMap}
              warehouses={warehouseMap}
              onAdd={() => setShowTransactionForm("KELUAR")}
              onExport={exportTransactions}
            />
          )}

          {active === "Mutasi" && (
            <TransactionModule
              title="Mutasi Gudang"
              type="MUTASI"
              transactions={filteredTransactions.filter((t) => t.type === "MUTASI")}
              products={productMap}
              warehouses={warehouseMap}
              onAdd={() => setShowTransactionForm("MUTASI")}
              onExport={exportTransactions}
            />
          )}

          {active === "Laporan" && (
            <ReportsModule
              transactions={filteredTransactions}
              products={productMap}
              warehouses={warehouseMap}
              transactionFilter={transactionFilter}
              setTransactionFilter={setTransactionFilter}
              dateFrom={dateFrom}
              setDateFrom={setDateFrom}
              dateTo={dateTo}
              setDateTo={setDateTo}
              warehouseFilter={warehouseFilter}
              setWarehouseFilter={setWarehouseFilter}
              onExport={exportTransactions}
              onReset={() => { setTransactionFilter("all"); setDateFrom(""); setDateTo(""); setWarehouseFilter("all"); setSearch(""); }}
            />
          )}

          {active === "Pengaturan" && (
            <SettingsModule
              warehouses={warehouses}
              onAdd={() => setShowWarehouseForm(true)}
              onReset={resetDemo}
            />
          )}

          <div className="mt-8 border-t border-[#DCE5DF] pt-5 text-xs text-[#7A887F]">Sata Inggil WMS • Data tersimpan di browser perangkat ini</div>
        </div>
      </main>

      {showProductForm && (
        <ProductForm
          initial={editingProduct}
          onClose={() => { setShowProductForm(false); setEditingProduct(null); }}
          onSave={saveProduct}
        />
      )}
      {showTransactionForm && (
        <TransactionForm
          type={showTransactionForm}
          products={products}
          warehouses={warehouses}
          onClose={() => setShowTransactionForm(null)}
          onSave={saveTransaction}
        />
      )}
      {showWarehouseForm && <WarehouseForm onClose={() => setShowWarehouseForm(false)} onSave={addWarehouse} />}
    </div>
  );
}

function Dashboard({
  totalStock,
  incoming,
  outgoing,
  productCount,
  transactionCount,
  lowStock,
  products,
  warehouses,
  transactions,
  onNavigate,
}: {
  totalStock: number;
  incoming: number;
  outgoing: number;
  productCount: number;
  transactionCount: number;
  lowStock: Stock[];
  products: Map<string, Product>;
  warehouses: Map<string, WarehouseItem>;
  transactions: Transaction[];
  onNavigate: (module: Module) => void;
}) {
  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const stats = [
    { title: "Total Stok", value: formatKg(totalStock), note: "Semua gudang", icon: Boxes },
    { title: "Barang Masuk", value: formatKg(incoming), note: "Bulan berjalan", icon: PackageCheck },
    { title: "Barang Keluar", value: formatKg(outgoing), note: "Bulan berjalan", icon: Truck },
    { title: "Jenis Barang", value: String(productCount), note: "Master aktif", icon: PackageOpen },
  ];
  return (
    <>
      <section className="overflow-hidden rounded-3xl bg-[#123B2E] p-6 text-white shadow-xl shadow-[#123B2E]/10 md:p-8">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full bg-[#F4C542] px-3 py-1 text-xs font-extrabold text-[#123B2E]">SISTEM GUDANG</span>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight md:text-4xl">Kontrol stok tembakau, dari penerimaan sampai pengeluaran.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">Dashboard ini memakai data yang tersimpan di browser. Transaksi yang dibuat dari modul akan langsung memengaruhi angka stok.</p>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ title, value, note, icon: Icon }) => (
          <div key={title} className="rounded-2xl border border-[#DCE5DF] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><div className="rounded-xl bg-[#EAF3D9] p-3 text-[#3D6B32]"><Icon size={21} /></div><span className="text-xs font-semibold text-[#7A887F]">Aktif</span></div>
            <p className="mt-5 text-sm font-medium text-[#718078]">{title}</p><p className="mt-1 text-2xl font-extrabold tracking-tight">{value}</p><p className="mt-1 text-xs text-[#8A958F]">{note}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-[#DCE5DF] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E8EDE9] p-5">
            <div><h3 className="font-bold">Aktivitas Terbaru</h3><p className="mt-1 text-xs text-[#7A887F]">{transactionCount} transaksi tersimpan</p></div>
            <button onClick={() => onNavigate("Laporan")} className="rounded-lg px-3 py-2 text-xs font-bold text-[#3D6B32] hover:bg-[#F1F6EA]">Lihat laporan</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-[#F8FAF7] text-xs uppercase tracking-wide text-[#7A887F]"><tr><th className="px-5 py-3">Aktivitas</th><th className="px-5 py-3">Barang</th><th className="px-5 py-3">Lokasi</th><th className="px-5 py-3">Jumlah</th><th className="px-5 py-3">Tanggal</th></tr></thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t.id} className="border-t border-[#EEF1EE]">
                    <td className="px-5 py-4 font-semibold">{t.note}</td>
                    <td className="px-5 py-4">{products.get(t.productId)?.name ?? "-"}</td>
                    <td className="px-5 py-4 text-[#66736C]">{t.type === "MUTASI" ? (warehouses.get(t.fromWarehouseId ?? "")?.name ?? "-") + " → " + (warehouses.get(t.toWarehouseId ?? "")?.name ?? "-") : warehouses.get((t.fromWarehouseId ?? t.toWarehouseId) ?? "")?.name ?? "-"}</td>
                    <td className="px-5 py-4 font-bold">{formatKg(t.quantity)}</td>
                    <td className="px-5 py-4 text-[#66736C]">{formatDate(t.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-[#DCE5DF] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><div><h3 className="font-bold">Akses Cepat</h3><p className="mt-1 text-xs text-[#7A887F]">Transaksi yang sering dipakai</p></div><ChevronRight size={18} className="text-[#9AA59F]" /></div>
            <div className="mt-5 space-y-3">
              {(["Barang Masuk", "Barang Keluar", "Mutasi"] as Module[]).map((label) => (
                <button key={label} onClick={() => onNavigate(label)} className="flex w-full items-center justify-between rounded-xl border border-[#E1E8E2] p-3 text-left transition hover:border-[#B7CCAD] hover:bg-[#F7FAF4]">
                  <span className="flex items-center gap-3 text-sm font-semibold"><span className="rounded-lg bg-[#F4C542]/20 p-2 text-[#8B6A00]">{label === "Barang Masuk" ? <PackagePlus size={18} /> : label === "Barang Keluar" ? <PackageMinus size={18} /> : <ArrowRightLeft size={18} />}</span>{label}</span><ChevronRight size={16} className="text-[#98A39D]" />
                </button>
              ))}
            </div>
          </div>
          <div className={"rounded-2xl border p-5 shadow-sm " + (lowStock.length ? "border-[#F0D89A] bg-[#FFF9E8]" : "border-[#DCE5DF] bg-white")}>
            <div className="flex items-center gap-3"><AlertTriangle size={20} className={lowStock.length ? "text-[#A97700]" : "text-[#3D6B32]"} /><div><h3 className="font-bold">Stok Minimum</h3><p className="text-xs text-[#7A887F]">{lowStock.length ? lowStock.length + " item perlu diperhatikan" : "Tidak ada stok di bawah batas minimum"}</p></div></div>
            {lowStock.slice(0, 3).map((item) => <div key={item.productId + item.warehouseId} className="mt-3 flex justify-between border-t border-black/5 pt-3 text-sm"><span>{products.get(item.productId)?.name}</span><b>{formatKg(item.quantity)}</b></div>)}
          </div>
        </div>
      </section>
    </>
  );
}

function ModuleHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#718078]">Sata Inggil WMS</p><h2 className="mt-1 text-2xl font-extrabold">{title}</h2><p className="mt-2 text-sm text-[#718078]">{description}</p></div>{action}</div>;
}

function StockModule({
  stocks, products, warehouses, search, setSearch, warehouseFilter, setWarehouseFilter, categoryFilter, setCategoryFilter, categories, lowStock,
}: {
  stocks: Stock[];
  products: Map<string, Product>;
  warehouses: Map<string, WarehouseItem>;
  search: string;
  setSearch: (v: string) => void;
  warehouseFilter: string;
  setWarehouseFilter: (v: string) => void;
  categoryFilter: string;
  setCategoryFilter: (v: string) => void;
  categories: string[];
  lowStock: Stock[];
}) {
  const total = stocks.reduce((s, item) => s + item.quantity, 0);
  return (
    <>
      <ModuleHeader title="Stok" description="Posisi stok aktual berdasarkan barang dan gudang." />
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Stok terfilter" value={formatKg(total)} icon={Boxes} />
        <SummaryCard label="Baris stok" value={String(stocks.length)} icon={ClipboardList} />
        <SummaryCard label="Perlu perhatian" value={String(lowStock.length)} icon={AlertTriangle} />
      </div>
      <div className="mt-6 rounded-2xl border border-[#DCE5DF] bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_200px_200px]">
          <label className="relative"><Search size={17} className="absolute left-3 top-3 text-[#98A39D]" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari barang atau kode..." className="w-full rounded-xl border border-[#DCE5DF] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#7DA16C]" /></label>
          <select value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)} className="rounded-xl border border-[#DCE5DF] px-3 text-sm"><option value="all">Semua gudang</option>{[...warehouses.values()].map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-xl border border-[#DCE5DF] px-3 text-sm"><option value="all">Semua kategori</option>{categories.map((c) => <option key={c}>{c}</option>)}</select>
        </div>
      </div>
      <DataTable headers={["Kode", "Barang", "Kategori", "Gudang", "Stok", "Minimum", "Status"]}>
        {stocks.map((item) => {
          const product = products.get(item.productId);
          const warehouse = warehouses.get(item.warehouseId);
          if (!product || !warehouse) return null;
          const low = item.quantity <= product.minStock;
          return <tr key={item.productId + item.warehouseId} className="border-t border-[#EEF1EE]"><td className="px-4 py-4 font-mono text-xs">{product.code}</td><td className="px-4 py-4 font-semibold">{product.name}</td><td className="px-4 py-4 text-[#66736C]">{product.category}</td><td className="px-4 py-4">{warehouse.name}</td><td className="px-4 py-4 font-extrabold">{formatKg(item.quantity)}</td><td className="px-4 py-4 text-[#66736C]">{formatKg(product.minStock)}</td><td className="px-4 py-4"><span className={"rounded-full px-2.5 py-1 text-xs font-bold " + (low ? "bg-[#FFF0C2] text-[#8A6500]" : "bg-[#EAF3D9] text-[#3D6B32]")}>{low ? "Minimum" : "Aman"}</span></td></tr>;
        })}
      </DataTable>
    </>
  );
}

function ProductsModule({ products, search, setSearch, onAdd, onEdit, onDelete }: { products: Product[]; search: string; setSearch: (v: string) => void; onAdd: () => void; onEdit: (p: Product) => void; onDelete: (id: string) => void; }) {
  const filtered = products.filter((p) => !search || (p.name + p.code + p.category).toLowerCase().includes(search.toLowerCase()));
  return (
    <>
      <ModuleHeader title="Barang" description="Master data jenis tembakau yang menjadi referensi semua transaksi." action={<button onClick={onAdd} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#123B2E] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1B4A3A]"><Plus size={17} />Tambah Barang</button>} />
      <div className="rounded-2xl border border-[#DCE5DF] bg-white p-4 shadow-sm"><label className="relative block max-w-xl"><Search size={17} className="absolute left-3 top-3 text-[#98A39D]" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama, kode, kategori..." className="w-full rounded-xl border border-[#DCE5DF] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#7DA16C]" /></label></div>
      <DataTable headers={["Kode", "Nama Barang", "Kategori", "Satuan", "Minimum", "Aksi"]}>
        {filtered.map((p) => <tr key={p.id} className="border-t border-[#EEF1EE]"><td className="px-4 py-4 font-mono text-xs">{p.code}</td><td className="px-4 py-4 font-semibold">{p.name}</td><td className="px-4 py-4">{p.category}</td><td className="px-4 py-4 uppercase">{p.unit}</td><td className="px-4 py-4">{formatKg(p.minStock)}</td><td className="px-4 py-4"><div className="flex gap-2"><button onClick={() => onEdit(p)} className="rounded-lg border border-[#DCE5DF] p-2 hover:bg-[#F5F7F3]" title="Edit"><Edit3 size={16} /></button><button onClick={() => onDelete(p.id)} className="rounded-lg border border-[#E9D1D1] p-2 text-[#9B4D4D] hover:bg-[#FFF5F5]" title="Hapus"><Trash2 size={16} /></button></div></td></tr>)}
      </DataTable>
    </>
  );
}

function TransactionModule({ title, type, transactions, products, warehouses, onAdd, onExport }: { title: string; type: TransactionType; transactions: Transaction[]; products: Map<string, Product>; warehouses: Map<string, WarehouseItem>; onAdd: () => void; onExport: () => void; }) {
  return (
    <>
      <ModuleHeader title={title} description={type === "MASUK" ? "Penerimaan stok ke gudang." : type === "KELUAR" ? "Pengeluaran stok dari gudang." : "Perpindahan stok dari satu gudang ke gudang lain."} action={<div className="flex gap-2"><button onClick={onExport} className="inline-flex items-center gap-2 rounded-xl border border-[#DCE5DF] bg-white px-4 py-2.5 text-sm font-bold"><Download size={17} />CSV</button><button onClick={onAdd} className="inline-flex items-center gap-2 rounded-xl bg-[#123B2E] px-4 py-2.5 text-sm font-bold text-white"><Plus size={17} />Tambah</button></div>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Jumlah transaksi" value={String(transactions.length)} icon={ClipboardList} />
        <SummaryCard label="Total kuantitas" value={formatKg(transactions.reduce((s, t) => s + t.quantity, 0))} icon={type === "MASUK" ? ArrowDownToLine : type === "KELUAR" ? ArrowUpFromLine : ArrowRightLeft} />
        <SummaryCard label="Transaksi terbaru" value={transactions[0] ? formatDate(transactions[0].date) : "-"} icon={CalendarDays} />
      </div>
      <DataTable headers={["Tanggal", "Referensi", "Barang", "Dari", "Ke", "Jumlah", "Catatan"]}>
        {transactions.map((t) => <tr key={t.id} className="border-t border-[#EEF1EE]"><td className="px-4 py-4">{formatDate(t.date)}</td><td className="px-4 py-4 font-mono text-xs">{t.reference}</td><td className="px-4 py-4 font-semibold">{products.get(t.productId)?.name ?? "-"}</td><td className="px-4 py-4">{t.fromWarehouseId ? warehouses.get(t.fromWarehouseId)?.name ?? "-" : "-"}</td><td className="px-4 py-4">{t.toWarehouseId ? warehouses.get(t.toWarehouseId)?.name ?? "-" : "-"}</td><td className="px-4 py-4 font-extrabold">{formatKg(t.quantity)}</td><td className="px-4 py-4 text-[#66736C]">{t.note}</td></tr>)}
      </DataTable>
    </>
  );
}

function ReportsModule({ transactions, products, warehouses, transactionFilter, setTransactionFilter, dateFrom, setDateFrom, dateTo, setDateTo, warehouseFilter, setWarehouseFilter, onExport, onReset }: { transactions: Transaction[]; products: Map<string, Product>; warehouses: Map<string, WarehouseItem>; transactionFilter: TransactionType | "all"; setTransactionFilter: (v: TransactionType | "all") => void; dateFrom: string; setDateFrom: (v: string) => void; dateTo: string; setDateTo: (v: string) => void; warehouseFilter: string; setWarehouseFilter: (v: string) => void; onExport: () => void; onReset: () => void; }) {
  const masuk = transactions.filter((t) => t.type === "MASUK").reduce((s, t) => s + t.quantity, 0);
  const keluar = transactions.filter((t) => t.type === "KELUAR").reduce((s, t) => s + t.quantity, 0);
  const mutasi = transactions.filter((t) => t.type === "MUTASI").reduce((s, t) => s + t.quantity, 0);
  return (
    <>
      <ModuleHeader title="Laporan" description="Gunakan filter untuk melihat transaksi dan ekspor hasilnya ke CSV." action={<button onClick={onExport} className="inline-flex items-center gap-2 rounded-xl bg-[#123B2E] px-4 py-2.5 text-sm font-bold text-white"><Download size={17} />Ekspor CSV</button>} />
      <div className="rounded-2xl border border-[#DCE5DF] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold"><Filter size={17} />Filter laporan</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select value={transactionFilter} onChange={(e) => setTransactionFilter(e.target.value as TransactionType | "all")} className="rounded-xl border border-[#DCE5DF] px-3 py-2.5 text-sm"><option value="all">Semua transaksi</option><option value="MASUK">Barang masuk</option><option value="KELUAR">Barang keluar</option><option value="MUTASI">Mutasi</option></select>
          <select value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)} className="rounded-xl border border-[#DCE5DF] px-3 py-2.5 text-sm"><option value="all">Semua gudang</option>{[...warehouses.values()].map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-xl border border-[#DCE5DF] px-3 py-2.5 text-sm" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-xl border border-[#DCE5DF] px-3 py-2.5 text-sm" />
          <button onClick={onReset} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCE5DF] px-3 py-2.5 text-sm font-bold hover:bg-[#F5F7F3]"><RefreshCcw size={16} />Reset</button>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3"><SummaryCard label="Barang masuk" value={formatKg(masuk)} icon={ArrowDownToLine} /><SummaryCard label="Barang keluar" value={formatKg(keluar)} icon={ArrowUpFromLine} /><SummaryCard label="Mutasi" value={formatKg(mutasi)} icon={ArrowRightLeft} /></div>
      <DataTable headers={["Tanggal", "Tipe", "Referensi", "Barang", "Dari", "Ke", "Jumlah"]}>
        {transactions.map((t) => <tr key={t.id} className="border-t border-[#EEF1EE]"><td className="px-4 py-4">{formatDate(t.date)}</td><td className="px-4 py-4"><span className="rounded-full bg-[#EAF3D9] px-2.5 py-1 text-xs font-bold">{t.type}</span></td><td className="px-4 py-4 font-mono text-xs">{t.reference}</td><td className="px-4 py-4 font-semibold">{products.get(t.productId)?.name ?? "-"}</td><td className="px-4 py-4">{t.fromWarehouseId ? warehouses.get(t.fromWarehouseId)?.name ?? "-" : "-"}</td><td className="px-4 py-4">{t.toWarehouseId ? warehouses.get(t.toWarehouseId)?.name ?? "-" : "-"}</td><td className="px-4 py-4 font-extrabold">{formatKg(t.quantity)}</td></tr>)}
      </DataTable>
    </>
  );
}

function SettingsModule({ warehouses, onAdd, onReset }: { warehouses: WarehouseItem[]; onAdd: () => void; onReset: () => void; }) {
  return (
    <>
      <ModuleHeader title="Pengaturan" description={descriptions.Pengaturan} />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#DCE5DF] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><div><h3 className="font-bold">Gudang</h3><p className="mt-1 text-xs text-[#7A887F]">Lokasi penyimpanan yang tersedia.</p></div><button onClick={onAdd} className="rounded-xl bg-[#123B2E] p-2.5 text-white" title="Tambah gudang"><Plus size={17} /></button></div>
          <div className="mt-5 space-y-3">{warehouses.map((w) => <div key={w.id} className="flex items-center gap-3 rounded-xl border border-[#E6ECE7] p-3"><div className="rounded-lg bg-[#EAF3D9] p-2 text-[#3D6B32]"><Warehouse size={18} /></div><div><p className="text-sm font-bold">{w.name}</p><p className="text-xs text-[#7A887F]">{w.location}</p></div></div>)}</div>
        </section>
        <section className="rounded-2xl border border-[#DCE5DF] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3"><Settings size={20} /><div><h3 className="font-bold">Data aplikasi</h3><p className="mt-1 text-xs text-[#7A887F]">Versi saat ini menyimpan data di localStorage browser.</p></div></div>
          <div className="mt-5 rounded-xl bg-[#F8FAF7] p-4 text-sm text-[#66736C]">Belum ada database, autentikasi, atau API eksternal di repository ini. Karena itu data transaksi bersifat lokal pada perangkat/browser yang digunakan.</div>
          <button onClick={onReset} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#E5CACA] px-4 py-2.5 text-sm font-bold text-[#9B4D4D] hover:bg-[#FFF7F7]"><RotateCcw size={16} />Reset data demo</button>
        </section>
      </div>
    </>
  );
}

function SummaryCard({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return <div className="rounded-2xl border border-[#DCE5DF] bg-white p-5 shadow-sm"><div className="rounded-xl bg-[#EAF3D9] p-2.5 w-fit text-[#3D6B32]"><Icon size={19} /></div><p className="mt-4 text-xs font-semibold text-[#718078]">{label}</p><p className="mt-1 text-xl font-extrabold">{value}</p></div>;
}

function DataTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return <div className="mt-6 overflow-hidden rounded-2xl border border-[#DCE5DF] bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#F8FAF7] text-xs uppercase tracking-wide text-[#7A887F]"><tr>{headers.map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div></div>;
}

function ProductForm({ initial, onClose, onSave }: { initial: Product | null; onClose: () => void; onSave: (product: Product) => void; }) {
  const [form, setForm] = useState<Product>(initial ?? { id: uid("prd"), code: "", name: "", category: "Rajangan", unit: "kg", minStock: 0 });
  const submit = (e: FormEvent) => { e.preventDefault(); if (!form.code.trim() || !form.name.trim() || form.minStock < 0) return; onSave({ ...form, code: form.code.trim().toUpperCase(), name: form.name.trim(), category: form.category.trim() }); };
  return <Modal title={initial ? "Edit Barang" : "Tambah Barang"} onClose={onClose}><form onSubmit={submit} className="space-y-4"><Field label="Kode barang"><input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input" placeholder="TMK-RJG-02" /></Field><Field label="Nama barang"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="Tembakau ..." /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Kategori"><input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input" /></Field><Field label="Minimum stok"><input required type="number" min="0" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} className="input" /></Field></div><Field label="Satuan"><select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value as Product["unit"] })} className="input"><option value="kg">kg</option><option value="bal">bal</option></select></Field><FormActions onClose={onClose} /></form></Modal>;
}

function TransactionForm({ type, products, warehouses, onClose, onSave }: { type: TransactionType; products: Product[]; warehouses: WarehouseItem[]; onClose: () => void; onSave: (t: Transaction) => void; }) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [quantity, setQuantity] = useState(0);
  const [date, setDate] = useState(today());
  const [fromWarehouseId, setFromWarehouseId] = useState(warehouses[0]?.id ?? "");
  const [toWarehouseId, setToWarehouseId] = useState(warehouses[1]?.id ?? warehouses[0]?.id ?? "");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const prefix = type === "MASUK" ? "IN" : type === "KELUAR" ? "OUT" : "MT";
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSave({ id: uid("trx"), type, date, productId, fromWarehouseId: type === "MASUK" ? null : fromWarehouseId, toWarehouseId: type === "KELUAR" ? null : toWarehouseId, quantity, reference: reference.trim() || prefix + "-" + date.replaceAll("-", "") + "-" + Math.floor(Math.random() * 900 + 100), note: note.trim() || (type === "MASUK" ? "Penerimaan stok" : type === "KELUAR" ? "Pengeluaran stok" : "Mutasi stok") });
  };
  return <Modal title={type === "MASUK" ? "Tambah Barang Masuk" : type === "KELUAR" ? "Tambah Barang Keluar" : "Tambah Mutasi"} onClose={onClose}><form onSubmit={submit} className="space-y-4"><Field label="Barang"><select required value={productId} onChange={(e) => setProductId(e.target.value)} className="input">{products.map((p) => <option key={p.id} value={p.id}>{p.code} • {p.name}</option>)}</select></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Tanggal"><input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" /></Field><Field label="Jumlah (kg)"><input required type="number" min="1" value={quantity || ""} onChange={(e) => setQuantity(Number(e.target.value))} className="input" /></Field></div>{type !== "MASUK" && <Field label="Gudang asal"><select required value={fromWarehouseId} onChange={(e) => setFromWarehouseId(e.target.value)} className="input">{warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></Field>}{type !== "KELUAR" && <Field label="Gudang tujuan"><select required value={toWarehouseId} onChange={(e) => setToWarehouseId(e.target.value)} className="input">{warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></Field>}<Field label="Nomor referensi"><input value={reference} onChange={(e) => setReference(e.target.value)} className="input" placeholder="Opsional, akan dibuat otomatis" /></Field><Field label="Catatan"><textarea value={note} onChange={(e) => setNote(e.target.value)} className="input min-h-24" placeholder="Keterangan transaksi..." /></Field><FormActions onClose={onClose} submitLabel="Simpan Transaksi" /></form></Modal>;
}

function WarehouseForm({ onClose, onSave }: { onClose: () => void; onSave: (name: string, location: string) => void; }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  return <Modal title="Tambah Gudang" onClose={onClose}><form onSubmit={(e) => { e.preventDefault(); if (name.trim()) onSave(name.trim(), location.trim() || "Lokasi belum diisi"); }} className="space-y-4"><Field label="Nama gudang"><input required value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Gudang C" /></Field><Field label="Keterangan lokasi"><input value={location} onChange={(e) => setLocation(e.target.value)} className="input" placeholder="Area penyimpanan" /></Field><FormActions onClose={onClose} submitLabel="Simpan Gudang" /></form></Modal>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-bold text-[#66736C]">{label}</span>{children}</label>;
}

function FormActions({ onClose, submitLabel = "Simpan" }: { onClose: () => void; submitLabel?: string }) {
  return <div className="flex justify-end gap-2 border-t border-[#E8EDE9] pt-4"><button type="button" onClick={onClose} className="rounded-xl border border-[#DCE5DF] px-4 py-2.5 text-sm font-bold">Batal</button><button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#123B2E] px-4 py-2.5 text-sm font-bold text-white"><Save size={16} />{submitLabel}</button></div>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="fixed inset-0 z-[60] grid place-items-center bg-black/45 p-4"><div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-[#E8EDE9] p-5"><h2 className="text-lg font-extrabold">{title}</h2><button onClick={onClose} className="rounded-lg p-2 hover:bg-[#F5F7F3]" aria-label="Tutup"><X size={19} /></button></div><div className="p-5">{children}</div></div></div>;
}
