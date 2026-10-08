"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  Home,
  LogOut,
  Menu,
  PackageCheck,
  PackageOpen,
  Settings,
  Truck,
  X,
} from "lucide-react";

const menu: { label: string; icon: LucideIcon }[] = [
  { label: "Dashboard", icon: Home },
  { label: "Stok", icon: Boxes },
  { label: "Barang", icon: PackageOpen },
  { label: "Barang Masuk", icon: PackageCheck },
  { label: "Barang Keluar", icon: Truck },
  { label: "Mutasi", icon: ClipboardList },
  { label: "Laporan", icon: BarChart3 },
];

const activities = [
  ["Penerimaan tembakau rajangan", "Gudang A", "2.450 kg", "08 Okt 2026"],
  ["Pemindahan stok", "Gudang A → Gudang B", "780 kg", "08 Okt 2026"],
  ["Pengeluaran produksi", "Gudang B", "1.120 kg", "07 Okt 2026"],
  ["Quality check", "Gudang A", "320 kg", "07 Okt 2026"],
];

type Stat = { title: string; value: string; note: string; icon: LucideIcon };

const stats: Stat[] = [
  { title: "Total Stok", value: "12.480 kg", note: "Stok tersimpan", icon: Boxes },
  { title: "Barang Masuk", value: "2.450 kg", note: "Bulan ini", icon: PackageCheck },
  { title: "Barang Keluar", value: "1.120 kg", note: "Bulan ini", icon: Truck },
  { title: "Jenis Tembakau", value: "18", note: "Aktif", icon: PackageOpen },
];

const quickActions: { label: string; icon: LucideIcon }[] = [
  { label: "Barang Masuk", icon: PackageCheck },
  { label: "Barang Keluar", icon: Truck },
  { label: "Mutasi", icon: ClipboardList },
];

const descriptions: Record<string, string> = {
  Stok: "Pantau jumlah stok tembakau berdasarkan gudang dan jenisnya.",
  Barang: "Kelola daftar jenis tembakau yang tersimpan di sistem.",
  "Barang Masuk": "Catat penerimaan tembakau yang masuk ke gudang.",
  "Barang Keluar": "Catat pengeluaran tembakau untuk produksi atau kebutuhan lain.",
  Mutasi: "Catat dan pantau perpindahan stok antar gudang.",
  Laporan: "Lihat ringkasan dan aktivitas gudang untuk kebutuhan pelaporan.",
  Pengaturan: "Kelola pengaturan sistem dan akun operator gudang.",
};

export default function Page() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("Dashboard");

  const selectMenu = (label: string) => {
    setActive(label);
    setOpen(false);
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
          <button onClick={() => selectMenu("Keluar")} className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/65 hover:bg-white/10 hover:text-white"><LogOut size={18} />Keluar</button>
        </div>
      </aside>

      {open && <button aria-label="Tutup navigasi" onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-black/40 lg:hidden" />}

      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#DCE5DF] bg-[#F5F7F3]/95 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="rounded-xl bg-white p-2.5 shadow-sm lg:hidden" aria-label="Buka menu"><Menu size={21} /></button>
            <div><p className="text-sm text-[#718078]">Selamat datang</p><h1 className="text-lg font-bold md:text-xl">{active}</h1></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block"><p className="text-sm font-bold">Operator Gudang</p><p className="text-xs text-[#718078]">Sata Inggil</p></div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#F4C542] font-extrabold text-[#123B2E]">SI</div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl p-4 md:p-8">
          {active === "Dashboard" ? (
            <>
              <section className="overflow-hidden rounded-3xl bg-[#123B2E] p-6 text-white shadow-xl shadow-[#123B2E]/10 md:p-8">
                <div className="max-w-2xl">
                  <span className="inline-flex rounded-full bg-[#F4C542] px-3 py-1 text-xs font-extrabold text-[#123B2E]">SISTEM GUDANG</span>
                  <h2 className="mt-4 text-2xl font-extrabold tracking-tight md:text-4xl">Kontrol stok tembakau, dari penerimaan sampai pengeluaran.</h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Pantau pergerakan barang dan aktivitas gudang Sata Inggil dalam satu dashboard yang ringkas.</p>
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
                  <div className="flex items-center justify-between border-b border-[#E8EDE9] p-5"><div><h3 className="font-bold">Aktivitas Gudang Terbaru</h3><p className="mt-1 text-xs text-[#7A887F]">Pergerakan stok terbaru</p></div><button onClick={() => selectMenu("Laporan")} className="rounded-lg px-3 py-2 text-xs font-bold text-[#3D6B32] hover:bg-[#F1F6EA]">Lihat semua</button></div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] text-left text-sm">
                      <thead className="bg-[#F8FAF7] text-xs uppercase tracking-wide text-[#7A887F]"><tr><th className="px-5 py-3">Aktivitas</th><th className="px-5 py-3">Lokasi</th><th className="px-5 py-3">Jumlah</th><th className="px-5 py-3">Tanggal</th></tr></thead>
                      <tbody>{activities.map((row, i) => <tr key={i} className="border-t border-[#EEF1EE]"><td className="px-5 py-4 font-semibold">{row[0]}</td><td className="px-5 py-4 text-[#66736C]">{row[1]}</td><td className="px-5 py-4 font-bold">{row[2]}</td><td className="px-5 py-4 text-[#66736C]">{row[3]}</td></tr>)}</tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#DCE5DF] bg-white p-5 shadow-sm">
                  <h3 className="font-bold">Akses Cepat</h3><p className="mt-1 text-xs text-[#7A887F]">Transaksi gudang yang sering digunakan</p>
                  <div className="mt-5 space-y-3">{quickActions.map(({ label, icon: Icon }) => <button key={label} onClick={() => selectMenu(label)} className="flex w-full items-center justify-between rounded-xl border border-[#E1E8E2] p-3 text-left transition hover:border-[#B7CCAD] hover:bg-[#F7FAF4]"><span className="flex items-center gap-3 text-sm font-semibold"><span className="rounded-lg bg-[#F4C542]/20 p-2 text-[#8B6A00]"><Icon size={18} /></span>{label}</span><span className="text-[#98A39D]">›</span></button>)}</div>
                </div>
              </section>
            </>
          ) : (
            <section className="rounded-3xl border border-[#DCE5DF] bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-[#EAF3D9] p-4 text-[#3D6B32]"><ActiveIcon size={28} /></div>
                <div><h2 className="text-2xl font-extrabold">{active}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#718078]">{descriptions[active] ?? "Sesi operator siap diakhiri."}</p></div>
              </div>
              <div className="mt-8 rounded-2xl border border-dashed border-[#C8D5CC] bg-[#F8FAF7] p-6 text-center">
                <p className="font-bold text-[#19352B]">{active === "Keluar" ? "Sesi operator siap diakhiri." : "Modul " + active + " siap dikembangkan."}</p>
                <p className="mt-1 text-sm text-[#7A887F]">Navigasi sudah aktif. Modul ini menjadi dasar untuk fitur transaksi berikutnya.</p>
              </div>
            </section>
          )}

          <div className="mt-8 border-t border-[#DCE5DF] pt-5 text-xs text-[#7A887F]">Sata Inggil WMS • Sistem Manajemen Gudang Tembakau</div>
        </div>
      </main>
    </div>
  );
}
