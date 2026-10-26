<?php
/**
 * Script nhập toàn bộ dữ liệu từ content/site.json & bookings.json vào WordPress
 * Chạy bằng: wp eval-file wp-content/themes/roman/import-data.php --allow-root
 */
if (!defined('ABSPATH')) {
    exit;
}

echo "=== BẮT ĐẦU ĐỒNG BỘ DỮ LIỆU ROMAN VÀO WORDPRESS ===\n";

// 1. Kích hoạt theme roman
switch_theme('roman');
require_once get_template_directory() . '/functions.php';

// Đăng ký lại CPT & Taxonomy trong tiến trình CLI hiện tại
do_action('init');

$site_file = ABSPATH . 'content/site.json';
if (!file_exists($site_file)) {
    fwrite(STDERR, "Không tìm thấy file: {$site_file}\n");
    exit(1);
}

$data = json_decode(file_get_contents($site_file), true);
if (!is_array($data)) {
    fwrite(STDERR, "Dữ liệu site.json không hợp lệ\n");
    exit(1);
}

update_option('roman_site_data', $data, false);
update_option('blogname', $data['site']['name'] ?? 'ROMAN');
update_option('blogdescription', $data['site']['tagline'] ?? 'Xưởng Chế Tác & Cá Nhân Hóa Nội Thất Ô Tô Cao Cấp');

// 2. Xóa bài viết mẫu mặc định của WordPress
wp_delete_post(1, true);
wp_delete_post(2, true);
wp_delete_post(3, true);

// 3. Nhập 6 Danh mục dịch vụ vào taxonomy roman_cat
echo "-> Đang nhập " . count($data['categories'] ?? []) . " danh mục dịch vụ...\n";
foreach (($data['categories'] ?? []) as $cat) {
    $term = term_exists($cat['id'], 'roman_cat');
    if (!$term) {
        wp_insert_term($cat['name'], 'roman_cat', [
            'slug'        => $cat['id'],
            'description' => $cat['desc'] ?? '',
        ]);
    }
}

// 4. Xóa các roman_product cũ (nếu chạy lại) và nhập 26 Sản phẩm & Dịch vụ
$old_prods = get_posts(['post_type' => 'roman_product', 'post_status' => 'any', 'posts_per_page' => -1, 'fields' => 'ids']);
foreach ($old_prods as $oid) {
    wp_delete_post($oid, true);
}

echo "-> Đang nhập " . count($data['products'] ?? []) . " sản phẩm & dịch vụ...\n";
$used_slugs = [];
foreach (($data['products'] ?? []) as $idx => $p) {
    $base_slug = roman_slugify($p['slug'] ?? ($p['name'] ?? '')) ?: $p['id'];
    $slug = $base_slug;
    $k = 2;
    while (in_array($slug, $used_slugs, true)) {
        $slug = $base_slug . '-' . ($k++);
    }
    $used_slugs[] = $slug;
    $p['slug'] = $slug;

    $post_id = wp_insert_post([
        'post_type'   => 'roman_product',
        'post_status' => !empty($p['hidden']) ? 'draft' : 'publish',
        'post_title'  => $p['name'],
        'post_name'   => $slug,
        'menu_order'  => $idx + 1,
    ]);

    if ($post_id && !is_wp_error($post_id)) {
        update_post_meta($post_id, '_roman_product_json', $p);
        update_post_meta($post_id, '_roman_id', $p['id']);
        update_post_meta($post_id, '_roman_cat', $p['cat']);
        wp_set_object_terms($post_id, [$p['cat']], 'roman_cat', false);
    }
}

// 5. Nhập các Câu chuyện / Bài viết (STORIES) vào WordPress Posts
$old_posts = get_posts(['post_type' => 'post', 'post_status' => 'any', 'posts_per_page' => -1, 'fields' => 'ids']);
foreach ($old_posts as $oid) {
    wp_delete_post($oid, true);
}

echo "-> Đang nhập " . count($data['stories'] ?? []) . " bài viết / câu chuyện...\n";
foreach (($data['stories'] ?? []) as $idx => $st) {
    $post_id = wp_insert_post([
        'post_type'    => 'post',
        'post_status'  => 'publish',
        'post_title'   => $st['title'],
        'post_name'    => roman_slugify($st['title']),
        'post_excerpt' => $st['desc'] ?? '',
        'post_content' => '<p>' . esc_html($st['desc'] ?? '') . '</p><p>Liên hệ ngay với xưởng chế tác <strong>ROMAN Bespoke Atelier</strong> qua hotline <strong>' . esc_html($data['site']['hotline'] ?? '0927 098 098') . '</strong> để được tư vấn trực tiếp và trải nghiệm mẫu da thực tế cho dòng xe của bạn.</p>',
        'menu_order'   => $idx + 1,
    ]);
    if ($post_id && !is_wp_error($post_id)) {
        update_post_meta($post_id, '_story_photo', $st['photo'] ?? 'ghe-07');
        update_post_meta($post_id, '_story_pool', implode(', ', $st['pool'] ?? [$st['photo'] ?? 'ghe-07']));
        update_post_meta($post_id, '_story_link', $st['link'] ?? '');
    }
}

// 6. Nhập các Trang chính (Pages) vào WordPress
$old_pages = get_posts(['post_type' => 'page', 'post_status' => 'any', 'posts_per_page' => -1, 'fields' => 'ids']);
foreach ($old_pages as $oid) {
    wp_delete_post($oid, true);
}

$main_pages = [
    ['slug' => 'trang-chu',   'title' => 'Trang chủ ROMAN Bespoke Atelier'],
    ['slug' => 'danh-muc',    'title' => 'Bảng giá niêm yết & Danh mục dịch vụ'],
    ['slug' => 'gioi-thieu',  'title' => 'Giới thiệu về ROMAN Bespoke Atelier'],
    ['slug' => 'ho-tro',      'title' => 'Hỗ trợ khách hàng & Đặt lịch thi công'],
    ['slug' => 'chinh-sach',  'title' => 'Chính sách bảo hành, bảo mật & Điều khoản'],
    ['slug' => 'so-do-trang', 'title' => 'Sơ đồ trang website ROMAN'],
];

$front_page_id = 0;
foreach ($main_pages as $idx => $mp) {
    $pid = wp_insert_post([
        'post_type'   => 'page',
        'post_status' => 'publish',
        'post_title'  => $mp['title'],
        'post_name'   => $mp['slug'],
        'menu_order'  => $idx + 1,
    ]);
    if ($mp['slug'] === 'trang-chu') {
        $front_page_id = $pid;
    }
}
if ($front_page_id) {
    update_option('show_on_front', 'page');
    update_option('page_on_front', $front_page_id);
}

// 7. Nhập Lịch hẹn cũ (nếu có trong content/bookings.json)
$bk_file = ABSPATH . 'content/bookings.json';
if (file_exists($bk_file)) {
    $bks = json_decode(file_get_contents($bk_file), true);
    if (is_array($bks) && count($bks) > 0) {
        echo "-> Đang nhập " . count($bks) . " lịch hẹn khách hàng...\n";
        foreach ($bks as $b) {
            $bid = wp_insert_post([
                'post_type'   => 'roman_booking',
                'post_status' => 'publish',
                'post_title'  => ($b['name'] ?? 'Khách') . ' — ' . ($b['phone'] ?? '') . (!empty($b['car']) ? ' (' . $b['car'] . ')' : ''),
            ]);
            if ($bid && !is_wp_error($bid)) {
                update_post_meta($bid, '_booking_name', $b['name'] ?? '');
                update_post_meta($bid, '_booking_phone', $b['phone'] ?? '');
                update_post_meta($bid, '_booking_car', $b['car'] ?? '');
                update_post_meta($bid, '_booking_date', $b['date'] ?? '');
                update_post_meta($bid, '_booking_topic', $b['topic'] ?? '');
                update_post_meta($bid, '_booking_msg', $b['msg'] ?? '');
                update_post_meta($bid, '_booking_status', $b['status'] ?? 'new');
                update_post_meta($bid, '_booking_note', $b['note'] ?? '');
                update_post_meta($bid, '_booking_source', $b['source'] ?? 'web');
            }
        }
    }
}

// 8. Nhập cấu hình Telegram (nếu có)
$tg_file = ABSPATH . 'content/telegram.json';
if (file_exists($tg_file)) {
    $tg = json_decode(file_get_contents($tg_file), true);
    if (is_array($tg)) {
        update_option('roman_telegram_cfg', $tg, false);
    }
}

// 9. Sinh js/data.js, sitemap.xml, robots.txt và làm mới rewrite rules
roman_sync_all_to_files($data);
flush_rewrite_rules();

echo "=== HOÀN TẤT ĐỒNG BỘ DỮ LIỆU ROMAN SANG WORDPRESS ===\n";
