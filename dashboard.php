<?php
/*
Template Name: Sata Inggil Dashboard
*/
if (!defined('ABSPATH')) exit;
get_header();
?>
<div class="si-shell">
<aside class="si-sidebar" id="siSidebar">
  <div class="si-brand">
    <div class="si-brand-mark">SI</div>
    <div><strong>Sata Inggil</strong><span>Gudang Tembakau</span></div>
  </div>
  <nav class="si-nav" aria-label="Menu utama">
    <a class="is-active" href="<?php echo esc_url(home_url('/dashboard/')); ?>">⌂ <span>Dashboard</span></a>
    <a href="<?php echo esc_url(home_url('/stok/')); ?>">▣ <span>Stok</span></a>
    <a href="<?php echo esc_url(home_url('/barang/')); ?>">◫ <span>Barang</span></a>
    <a href="<?php echo esc_url(home_url('/barang-masuk/')); ?>">↓ <span>Barang Masuk</span></a>
    <a href="<?php echo esc_url(home_url('/barang-keluar/')); ?>">↑ <span>Barang Keluar</span></a>
    <a href="<?php echo esc_url(home_url('/mutasi/')); ?>">↔ <span>Mutasi</span></a>
    <a href="<?php echo esc_url(home_url('/laporan/')); ?>">▤ <span>Laporan</span></a>
  </nav>
  <div class="si-sidebar-footer">Sata Inggil WMS · v0.1.0</div>
</aside>
<main class="si-main">
  <header class="si-topbar">
    <div style="display:flex;align-items:center;gap:8px">
      <button class="si-mobile-menu" id="siMenu" aria-label="Buka menu">☰</button>
      <span class="si-topbar-title">Warehouse Management System</span>
    </div>
    <div class="si-user"><span class="si-user-name"><?php echo esc_html(wp_get_current_user()->display_name ?: 'Operator'); ?></span><span class="si-avatar"><?php echo esc_html(strtoupper(substr(wp_get_current_user()->display_name ?: 'O',0,1))); ?></span></div>
  </header>
  <div class="si-content">
    <div class="si-heading">
      <div><h1>Dashboard</h1><p>Ringkasan aktivitas Gudang Sata Inggil hari ini.</p></div>
      <div class="si-actions"><a class="si-button si-button--yellow" href="<?php echo esc_url(home_url('/barang-masuk/')); ?>">+ Barang Masuk</a><a class="si-button" href="<?php echo esc_url(home_url('/barang-keluar/')); ?>">+ Barang Keluar</a></div>
    </div>
    <section class="si-stat-grid">
      <article class="si-card si-stat"><div class="si-stat-top"><span class="si-stat-label">Total Stok</span><span class="si-stat-icon">▣</span></div><div class="si-stat-value">0 kg</div><div class="si-stat-note">Belum ada data transaksi</div></article>
      <article class="si-card si-stat"><div class="si-stat-top"><span class="si-stat-label">Barang Masuk</span><span class="si-stat-icon">↓</span></div><div class="si-stat-value">0</div><div class="si-stat-note">Transaksi hari ini</div></article>
      <article class="si-card si-stat"><div class="si-stat-top"><span class="si-stat-label">Barang Keluar</span><span class="si-stat-icon">↑</span></div><div class="si-stat-value">0</div><div class="si-stat-note">Transaksi hari ini</div></article>
      <article class="si-card si-stat"><div class="si-stat-top"><span class="si-stat-label">Jenis Tembakau</span><span class="si-stat-icon">◫</span></div><div class="si-stat-value">0</div><div class="si-stat-note">Master barang</div></article>
    </section>
    <div class="si-grid">
      <section class="si-card si-section">
        <div class="si-section-head"><h2>Aktivitas Terbaru</h2><a href="<?php echo esc_url(home_url('/laporan/')); ?>">Lihat semua</a></div>
        <div class="si-table-wrap"><table class="si-table"><thead><tr><th>Waktu</th><th>Aktivitas</th><th>Batch</th><th>Status</th></tr></thead><tbody><tr><td colspan="4">Belum ada aktivitas gudang.</td></tr></tbody></table></div>
      </section>
      <section class="si-card si-section">
        <div class="si-section-head"><h2>Aksi Cepat</h2></div>
        <div class="si-quick">
          <a href="<?php echo esc_url(home_url('/barang/')); ?>"><span class="si-quick-label"><span class="si-quick-icon">+</span>Tambah master barang</span><span>›</span></a>
          <a href="<?php echo esc_url(home_url('/mutasi/')); ?>"><span class="si-quick-label"><span class="si-quick-icon">↔</span>Catat mutasi stok</span><span>›</span></a>
          <a href="<?php echo esc_url(home_url('/laporan/')); ?>"><span class="si-quick-label"><span class="si-quick-icon">▤</span>Buka laporan</span><span>›</span></a>
        </div>
      </section>
    </div>
  </div>
</main>
</div>
<?php get_footer(); ?>
