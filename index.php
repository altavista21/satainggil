<?php
if (!defined('ABSPATH')) exit;
get_header();
?>
<main style="min-height:100vh;display:grid;place-items:center;padding:24px">
  <div class="si-card" style="max-width:680px;width:100%;padding:40px;text-align:center">
    <div class="si-brand-mark" style="margin:0 auto 18px">SI</div>
    <h1 style="margin:0 0 8px">Sata Inggil</h1>
    <p style="margin:0 0 24px;color:var(--si-muted)">Warehouse Management System · Gudang Tembakau</p>
    <a class="si-button" href="<?php echo esc_url(home_url('/dashboard/')); ?>">Buka Dashboard</a>
  </div>
</main>
<?php get_footer(); ?>
