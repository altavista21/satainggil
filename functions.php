<?php
if (!defined('ABSPATH')) exit;

function sata_inggil_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', array('search-form','comment-form','comment-list','gallery','caption','style','script'));
    register_nav_menus(array('primary'=>'Menu Utama'));
}
add_action('after_setup_theme','sata_inggil_setup');

function sata_inggil_assets() {
    wp_enqueue_style('sata-inggil-style', get_stylesheet_uri(), array(), '0.1.0');
    wp_enqueue_script('sata-inggil-js', get_template_directory_uri().'/assets/js/wms.js', array(), '0.1.0', true);
}
add_action('wp_enqueue_scripts','sata_inggil_assets');

function sata_inggil_dashboard_template($template) {
    if (is_page_template('dashboard.php')) return get_template_directory().'/dashboard.php';
    return $template;
}
add_filter('template_include','sata_inggil_dashboard_template');
