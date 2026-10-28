<?php
/**
 * ROMAN Bespoke Atelier - WordPress Theme Functions & Admin System
 */
if (!defined('ABSPATH')) {
    exit;
}

define('ROMAN_VERSION', '2.0.0');

/* ---------- 1. Khởi tạo Theme & Hỗ trợ cơ bản ---------- */
add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', ['search-form', 'gallery', 'caption', 'style', 'script']);
});

/* Ngăn WordPress báo 404 trên các đường dẫn .html truyền thống của ROMAN */
add_filter('pre_handle_404', function ($preempt, $wp_query) {
    $uri = trim(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH), '/');
    $valid_html = ['index.html', 'category.html', 'about.html', 'support.html', 'chinh-sach.html', 'so-do-trang.html', 'product.html', 'danh-muc', 'gioi-thieu', 'ho-tro', 'chinh-sach', 'so-do-trang'];
    if ($uri === '' || in_array($uri, $valid_html, true) || preg_match('#^san-pham/[^/]+$#', $uri)) {
        $wp_query->is_404 = false;
        status_header(200);
        return true;
    }
    return $preempt;
}, 10, 2);

/* Ngăn WordPress canonical redirect tự động thêm trailing slash vào các URL .html */
add_filter('redirect_canonical', function ($redirect_url, $requested_url) {
    $path = parse_url($requested_url, PHP_URL_PATH);
    if (preg_match('#\.[a-zA-Z0-9]+/?$#', $path)) {
        return false;
    }
    return $redirect_url;
}, 10, 2);

/* Nếu URL bị dính dấu gạch chéo ở đuôi .html/ (do cache cũ), chuyển hướng chuẩn về .html */
add_action('template_redirect', function () {
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
    if (preg_match('#^/(.+\.html)/+$#i', $uri, $m)) {
        $query = !empty($_SERVER['QUERY_STRING']) ? ('?' . $_SERVER['QUERY_STRING']) : '';
        wp_redirect(home_url('/' . $m[1] . $query), 301);
        exit;
    }
}, 1);

/* ---------- 2. Tiện ích đọc / ghi dữ liệu gốc (site.json & Option) ---------- */
function roman_site_json_path() {
    return ABSPATH . 'content/site.json';
}

function roman_get_data() {
    static $cache = null;
    if ($cache !== null) {
        return $cache;
    }
    $opt = get_option('roman_site_data');
    if (is_array($opt) && !empty($opt['site'])) {
        $cache = $opt;
        return $cache;
    }
    $path = roman_site_json_path();
    if (file_exists($path)) {
        $raw = file_get_contents($path);
        $data = json_decode($raw, true);
        if (is_array($data)) {
            update_option('roman_site_data', $data, false);
            $cache = $data;
            return $cache;
        }
    }
    $cache = [];
    return $cache;
}

function roman_slugify($str, $max = 80) {
    $str = (string) $str;
    $map = [
        'à'=>'a','á'=>'a','ạ'=>'a','ả'=>'a','ã'=>'a','â'=>'a','ầ'=>'a','ấ'=>'a','ậ'=>'a','ẩ'=>'a','ẫ'=>'a','ă'=>'a','ằ'=>'a','ắ'=>'a','ặ'=>'a','ẳ'=>'a','ẵ'=>'a',
        'è'=>'e','é'=>'e','ẹ'=>'e','ẻ'=>'e','ẽ'=>'e','ê'=>'e','ề'=>'e','ế'=>'e','ệ'=>'e','ể'=>'e','ễ'=>'e',
        'ì'=>'i','í'=>'i','ị'=>'i','ỉ'=>'i','ĩ'=>'i',
        'ò'=>'o','ó'=>'o','ọ'=>'o','ỏ'=>'o','õ'=>'o','ô'=>'o','ồ'=>'o','ố'=>'o','ộ'=>'o','ổ'=>'o','ỗ'=>'o','ơ'=>'o','ờ'=>'o','ớ'=>'o','ợ'=>'o','ở'=>'o','ỡ'=>'o',
        'ù'=>'u','ú'=>'u','ụ'=>'u','ủ'=>'u','ũ'=>'u','ư'=>'u','ừ'=>'u','ứ'=>'u','ự'=>'u','ử'=>'u','ữ'=>'u',
        'ỳ'=>'y','ý'=>'y','ỵ'=>'y','ỷ'=>'y','ỹ'=>'y','đ'=>'d',
        'À'=>'a','Á'=>'a','Ạ'=>'a','Ả'=>'a','Ã'=>'a','Â'=>'a','Ầ'=>'a','Ấ'=>'a','Ậ'=>'a','Ẩ'=>'a','Ẫ'=>'a','Ă'=>'a','Ằ'=>'a','Ắ'=>'a','Ặ'=>'a','Ẳ'=>'a','Ẵ'=>'a',
        'È'=>'e','É'=>'e','Ẹ'=>'e','Ẻ'=>'e','Ẽ'=>'e','Ê'=>'e','Ề'=>'e','Ế'=>'e','Ệ'=>'e','Ể'=>'e','Ễ'=>'e',
        'Ì'=>'i','Í'=>'i','Ị'=>'i','Ỉ'=>'i','Ĩ'=>'i',
        'Ò'=>'o','Ó'=>'o','Ọ'=>'o','Ỏ'=>'o','Õ'=>'o','Ô'=>'o','Ồ'=>'o','Ố'=>'o','Ộ'=>'o','Ổ'=>'o','Ỗ'=>'o','Ơ'=>'o','Ờ'=>'o','Ớ'=>'o','Ợ'=>'o','Ở'=>'o','Ỡ'=>'o',
        'Ù'=>'u','Ú'=>'u','Ụ'=>'u','Ủ'=>'u','Ũ'=>'u','Ư'=>'u','Ừ'=>'u','Ứ'=>'u','Ự'=>'u','Ử'=>'u','Ữ'=>'u',
        'Ỳ'=>'y','Ý'=>'y','Ỵ'=>'y','Ỷ'=>'y','Ỹ'=>'y','Đ'=>'d',
    ];
    $str = strtr($str, $map);
    $str = strtolower($str);
    $str = preg_replace('/[^a-z0-9]+/', '-', $str);
    $str = trim($str, '-');
    return substr($str, 0, $max);
}

function roman_fmt_vnd($n) {
    return number_format((float) $n, 0, ',', '.');
}

function roman_mb_ucfirst($str) {
    if ($str === '' || $str === null) return '';
    return mb_strtoupper(mb_substr($str, 0, 1, 'UTF-8'), 'UTF-8') . mb_substr($str, 1, null, 'UTF-8');
}

function roman_mb_lcfirst($str) {
    if ($str === '' || $str === null) return '';
    return mb_strtolower(mb_substr($str, 0, 1, 'UTF-8'), 'UTF-8') . mb_substr($str, 1, null, 'UTF-8');
}

/* ---------- 3. Đăng ký Custom Post Types: Sản phẩm & Lịch hẹn ---------- */
add_action('init', function () {
    register_post_type('roman_product', [
        'labels' => [
            'name'               => 'Sản phẩm & Dịch vụ',
            'singular_name'      => 'Sản phẩm / Dịch vụ',
            'menu_name'          => 'Sản phẩm ROMAN',
            'add_new'            => 'Thêm dịch vụ mới',
            'add_new_item'       => 'Thêm Sản phẩm / Dịch vụ mới',
            'edit_item'          => 'Chỉnh sửa Sản phẩm / Dịch vụ',
            'new_item'           => 'Dịch vụ mới',
            'view_item'          => 'Xem trên web',
            'search_items'       => 'Tìm kiếm dịch vụ',
            'not_found'          => 'Không tìm thấy dịch vụ nào',
            'not_found_in_trash' => 'Không có dịch vụ nào trong thùng rác',
        ],
        'public'              => true,
        'has_archive'         => false,
        'show_in_rest'        => true,
        'menu_Position'       => 5,
        'menu_icon'           => 'dashicons-car',
        'supports'            => ['title', 'page-attributes'],
        'rewrite'             => ['slug' => 'san-pham', 'with_front' => false],
    ]);

    register_taxonomy('roman_cat', ['roman_product'], [
        'labels' => [
            'name'          => 'Danh mục dịch vụ',
            'singular_name' => 'Danh mục',
            'menu_name'     => 'Danh mục dịch vụ',
            'all_items'     => 'Tất cả danh mục',
            'edit_item'     => 'Sửa danh mục',
            'add_new_item'  => 'Thêm danh mục mới',
        ],
        'hierarchical'      => true,
        'public'            => true,
        'show_admin_column' => true,
        'show_in_rest'      => true,
        'rewrite'           => ['slug' => 'danh-muc-dich-vu', 'with_front' => false],
    ]);

    register_post_type('roman_booking', [
        'labels' => [
            'name'               => 'Lịch hẹn khách hàng',
            'singular_name'      => 'Lịch hẹn',
            'menu_name'          => 'Lịch hẹn',
            'add_new'            => 'Thêm lịch hẹn',
            'add_new_item'       => 'Thêm lịch hẹn mới',
            'edit_item'          => 'Chi tiết & Xử lý lịch hẹn',
            'search_items'       => 'Tìm theo tên / SĐT / dòng xe',
            'not_found'          => 'Chưa có lịch hẹn nào',
        ],
        'public'              => false,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'menu_position'       => 6,
        'menu_icon'           => 'dashicons-calendar-alt',
        'supports'            => ['title'],
    ]);
});

/* Hiển thị số lượng lịch hẹn mới (badge đỏ) trên menu Lịch hẹn trong /wp-admin/ */
add_action('admin_menu', function () {
    global $menu;
    $new_bookings = get_posts([
        'post_type'      => 'roman_booking',
        'post_status'    => 'publish',
        'posts_per_page' => -1,
        'fields'         => 'ids',
        'meta_key'       => '_booking_status',
        'meta_value'     => 'new',
    ]);
    $count = is_array($new_bookings) ? count($new_bookings) : 0;
    if ($count > 0 && is_array($menu)) {
        foreach ($menu as $k => $item) {
            if (isset($item[2]) && $item[2] === 'edit.php?post_type=roman_booking') {
                $menu[$k][0] .= sprintf(' <span class="update-plugins count-%1$d"><span class="plugin-count">%1$d</span></span>', $count);
                break;
            }
        }
    }
}, 99);

/* ---------- 4. Cột hiển thị & Metabox cho Sản phẩm (`roman_product`) ---------- */
add_filter('manage_roman_product_posts_columns', function ($cols) {
    return [
        'cb'         => $cols['cb'],
        'photo'      => 'Ảnh',
        'title'      => 'Tên sản phẩm / Dịch vụ',
        'roman_id'   => 'Mã SP',
        'roman_cat'  => 'Danh mục / Nhóm con',
        'roman_price'=> 'Giá niêm yết',
        'roman_tag'  => 'Nhãn',
        'date'       => 'Cập nhật',
    ];
});

add_action('manage_roman_product_posts_custom_column', function ($col, $post_id) {
    $p = get_post_meta($post_id, '_roman_product_json', true);
    if (!is_array($p)) $p = [];
    if ($col === 'photo') {
        $photos = $p['photos'] ?? [];
        if (!empty($photos[0])) {
            $src = esc_url(home_url('/assets/photos/' . $photos[0] . '-sm.jpg'));
            echo '<img src="' . $src . '" style="width:68px;height:48px;object-fit:cover;border-radius:6px;border:1px solid #ddd" alt="">';
        } else {
            echo '<span style="color:#999">—</span>';
        }
    } elseif ($col === 'roman_id') {
        echo '<code>' . esc_html($p['id'] ?? get_post_field('post_name', $post_id)) . '</code>';
    } elseif ($col === 'roman_cat') {
        $data = roman_get_data();
        $cat_name = $p['cat'] ?? '';
        foreach (($data['categories'] ?? []) as $c) {
            if ($c['id'] === $cat_name) {
                $cat_name = $c['name'];
                break;
            }
        }
        echo '<strong>' . esc_html($cat_name) . '</strong>';
        if (!empty($p['sub'])) {
            echo '<br><span style="color:#666;font-size:12px">' . esc_html($p['sub']) . '</span>';
        }
    } elseif ($col === 'roman_price') {
        $prices = array_filter(array_map('intval', $p['prices'] ?? []));
        if (!empty($prices)) {
            $min = min($prices);
            $unit = $p['unit'] ?? 'bộ';
            echo '<strong style="color:#1b6e2d">' . (count(array_unique($prices)) > 1 ? 'Từ ' : '') . roman_fmt_vnd($min) . '₫ / ' . esc_html($unit) . '</strong>';
        } else {
            echo '<span style="color:#666">Liên hệ báo giá</span>';
        }
    } elseif ($col === 'roman_tag') {
        if (!empty($p['tag'])) {
            echo '<span style="background:#1c1c1f;color:#d6b06a;padding:3px 8px;border-radius:12px;font-size:11px;font-weight:600">' . esc_html($p['tag']) . '</span>';
        } else {
            echo '—';
        }
    }
}, 10, 2);

add_action('add_meta_boxes', function () {
    add_meta_box(
        'roman_product_box',
        'Thông tin chi tiết Sản phẩm / Dịch vụ ROMAN',
        'roman_render_product_metabox',
        'roman_product',
        'normal',
        'high'
    );
    add_meta_box(
        'roman_booking_box',
        'Thông tin Khách hàng & Trạng thái xử lý Lịch hẹn',
        'roman_render_booking_metabox',
        'roman_booking',
        'normal',
        'high'
    );
    add_meta_box(
        'roman_story_box',
        'Cấu hình hiển thị Câu chuyện (Trang chủ ROMAN)',
        'roman_render_story_metabox',
        'post',
        'normal',
        'high'
    );
});

function roman_render_product_metabox($post) {
    wp_nonce_field('roman_save_product', 'roman_product_nonce');
    $p = get_post_meta($post->ID, '_roman_product_json', true);
    if (!is_array($p)) {
        $p = [
            'id'          => $post->post_name ?: '',
            'cat'         => 'ghe-da',
            'sub'         => '',
            'nick'        => '',
            'tag'         => '',
            'unit'        => 'bộ',
            'short'       => '',
            'optionLabel' => 'Loại xe',
            'options'     => ['Xe 5 chỗ', 'Xe 7 chỗ'],
            'prices'      => [0, 0],
            'colors'      => [['Đen Obsidian', '#1c1c1f']],
            'highlights'  => [],
            'specs'       => [],
            'photos'      => [],
            'autoPrice'   => true,
        ];
    }
    $data = roman_get_data();
    $cats = $data['categories'] ?? [];

    // Format options + prices lines
    $opt_lines = [];
    $opts = $p['options'] ?? ['Tiêu chuẩn'];
    $prices = $p['prices'] ?? [];
    foreach ($opts as $i => $opt_name) {
        $pr = isset($prices[$i]) ? (int) $prices[$i] : 0;
        $opt_lines[] = $opt_name . ' | ' . $pr;
    }

    // Format colors lines
    $col_lines = [];
    foreach (($p['colors'] ?? []) as $c) {
        if (is_array($c) && count($c) >= 2) {
            $col_lines[] = $c[0] . ' | ' . $c[1];
        }
    }

    // Format specs lines
    $spec_lines = [];
    foreach (($p['specs'] ?? []) as $k => $v) {
        $spec_lines[] = $k . ' | ' . $v;
    }

    $photos_str = implode(', ', $p['photos'] ?? []);
    ?>
    <style>
        .roman-mb-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .roman-mb-field { margin-bottom: 14px; }
        .roman-mb-field label { display: block; font-weight: 600; margin-bottom: 5px; color: #1d2327; }
        .roman-mb-field input[type="text"], .roman-mb-field select, .roman-mb-field textarea { width: 100%; padding: 7px 10px; border: 1px solid #8c8f94; border-radius: 4px; }
        .roman-mb-hint { font-size: 12px; color: #646970; margin-top: 4px; }
        .roman-photo-preview { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px; }
        .roman-photo-preview div { text-align: center; font-size: 11px; color: #555; }
        .roman-photo-preview img { width: 96px; height: 70px; object-fit: cover; border-radius: 6px; border: 1px solid #ccc; display: block; margin-bottom: 2px; }
    </style>
    <div class="roman-mb-grid">
        <div class="roman-mb-field">
            <label>Mã định danh sản phẩm (ID duy nhất)</label>
            <input type="text" name="roman_p[id]" value="<?php echo esc_attr($p['id'] ?? ''); ?>" placeholder="VD: ghe-nappa-6d">
            <div class="roman-mb-hint">Chữ thường không dấu và gạch ngang. Để trống sẽ tự tạo từ tiêu đề.</div>
        </div>
        <div class="roman-mb-field">
            <label>Danh mục chính</label>
            <select name="roman_p[cat]">
                <?php foreach ($cats as $c): ?>
                    <option value="<?php echo esc_attr($c['id']); ?>" <?php selected($p['cat'] ?? '', $c['id']); ?>>
                        <?php echo esc_html($c['name'] . ' (' . $c['id'] . ')'); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="roman-mb-field">
            <label>Nhóm con (Sub-category)</label>
            <input type="text" name="roman_p[sub]" value="<?php echo esc_attr($p['sub'] ?? ''); ?>" placeholder="VD: Ghế da ROMAN, Ghế Limousine, Sàn ROMAN 360...">
        </div>
        <div class="roman-mb-field">
            <label>Tên gọi ngắn (Hiển thị ở thẻ nhỏ trang chủ)</label>
            <input type="text" name="roman_p[nick]" value="<?php echo esc_attr($p['nick'] ?? ''); ?>" placeholder="VD: Nappa Fiber">
        </div>
        <div class="roman-mb-field">
            <label>Nhãn nổi bật (Badge)</label>
            <input type="text" name="roman_p[tag]" value="<?php echo esc_attr($p['tag'] ?? ''); ?>" placeholder="VD: Bán chạy, Cao cấp, Mới, Bespoke VIP">
        </div>
        <div class="roman-mb-field">
            <label>Đơn vị tính & Nhãn tùy chọn</label>
            <div style="display:flex;gap:8px">
                <input type="text" name="roman_p[unit]" value="<?php echo esc_attr($p['unit'] ?? 'bộ'); ?>" placeholder="Đơn vị: bộ, mét..." style="width:40%">
                <input type="text" name="roman_p[optionLabel]" value="<?php echo esc_attr($p['optionLabel'] ?? 'Loại xe'); ?>" placeholder="Nhãn: Loại xe, Cấu hình..." style="width:60%">
            </div>
        </div>
    </div>

    <div class="roman-mb-field">
        <label>Mô tả ngắn (Hiển thị dưới tên sản phẩm và trên thẻ danh mục)</label>
        <textarea name="roman_p[short]" rows="2"><?php echo esc_textarea($p['short'] ?? ''); ?></textarea>
    </div>

    <div class="roman-mb-grid">
        <div class="roman-mb-field">
            <label>Bảng giá & Tùy chọn (Mỗi dòng: <code>Tên tùy chọn | Giá VND</code>)</label>
            <textarea name="roman_p[options_raw]" rows="4" placeholder="Xe 5 chỗ | 7500000&#10;Xe 7 chỗ | 9500000"><?php echo esc_textarea(implode("\n", $opt_lines)); ?></textarea>
            <div class="roman-mb-hint">Nhập giá = <code>0</code> nếu muốn hiển thị <b>"Liên hệ báo giá"</b>.</div>
            <label style="margin-top:8px;font-weight:400">
                <input type="checkbox" name="roman_p[autoPrice]" value="1" <?php checked(($p['autoPrice'] ?? true) !== false); ?>>
                Tự động thêm dòng giá niêm yết vào đầu Đặc điểm nổi bật & Thông số
            </label>
        </div>
        <div class="roman-mb-field">
            <label>Bảng màu sắc (Mỗi dòng: <code>Tên màu | Mã màu HEX</code>)</label>
            <textarea name="roman_p[colors_raw]" rows="5" placeholder="Nâu Cognac | #6b3f26&#10;Đen Obsidian | #1c1c1f&#10;Kem Hoàng Gia | #d8c3a5"><?php echo esc_textarea(implode("\n", $col_lines)); ?></textarea>
        </div>
    </div>

    <div class="roman-mb-grid">
        <div class="roman-mb-field">
            <label>Đặc điểm nổi bật (Mỗi dòng 1 ý)</label>
            <textarea name="roman_p[highlights_raw]" rows="6"><?php echo esc_textarea(implode("\n", $p['highlights'] ?? [])); ?></textarea>
        </div>
        <div class="roman-mb-field">
            <label>Thông số & Quy chuẩn dịch vụ (Mỗi dòng: <code>Tên thông số | Giá trị</code>)</label>
            <textarea name="roman_p[specs_raw]" rows="6" placeholder="Chất liệu | Da Nappa Microfiber cao cấp&#10;Độ dày | 1.2 mm&#10;Bảo hành | 3 năm"><?php echo esc_textarea(implode("\n", $spec_lines)); ?></textarea>
        </div>
    </div>

    <div class="roman-mb-field">
        <label>Danh sách mã ảnh Studio (Cách nhau bởi dấu phẩy, nằm trong thư mục <code>/assets/photos/</code>)</label>
        <input type="text" name="roman_p[photos_raw]" value="<?php echo esc_attr($photos_str); ?>" placeholder="VD: ghe-02, ghe-07, ghe-01, ghe-06">
        <div class="roman-mb-hint">Ảnh đầu tiên sẽ là ảnh đại diện chính của sản phẩm. Bạn có thể tải thêm ảnh mới trong mục <b>Cài đặt ROMAN → Thư viện Ảnh Studio</b>.</div>
        <?php if (!empty($p['photos'])): ?>
            <div class="roman-photo-preview">
                <?php foreach ($p['photos'] as $ph): ?>
                    <div>
                        <img src="<?php echo esc_url(home_url('/assets/photos/' . $ph . '-sm.jpg')); ?>" alt="<?php echo esc_attr($ph); ?>">
                        <code><?php echo esc_html($ph); ?></code>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
    <?php
}

add_action('save_post_roman_product', function ($post_id, $post, $update) {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!isset($_POST['roman_product_nonce']) || !wp_verify_nonce($_POST['roman_product_nonce'], 'roman_save_product')) return;
    if (!current_user_can('edit_post', $post_id)) return;

    $in = wp_unslash($_POST['roman_p'] ?? []);
    $old = get_post_meta($post_id, '_roman_product_json', true);
    if (!is_array($old)) $old = [];

    $id = roman_slugify($in['id'] ?? '') ?: ($old['id'] ?? roman_slugify($post->post_title));
    $cat = sanitize_text_field($in['cat'] ?? 'ghe-da');
    $sub = sanitize_text_field($in['sub'] ?? '');
    $nick = sanitize_text_field($in['nick'] ?? '');
    $tag = sanitize_text_field($in['tag'] ?? '');
    $unit = sanitize_text_field($in['unit'] ?? 'bộ');
    $optionLabel = sanitize_text_field($in['optionLabel'] ?? 'Loại xe');
    $short = sanitize_textarea_field($in['short'] ?? '');

    $options = [];
    $prices = [];
    $opt_lines = preg_split('/\r\n|\r|\n/', trim($in['options_raw'] ?? ''));
    foreach ($opt_lines as $line) {
        $line = trim($line);
        if ($line === '') continue;
        $parts = array_map('trim', explode('|', $line, 2));
        $options[] = $parts[0] ?: 'Tiêu chuẩn';
        $prices[] = isset($parts[1]) ? max(0, (int) preg_replace('/[^\d]/', '', $parts[1])) : 0;
    }
    if (empty($options)) {
        $options = ['Tiêu chuẩn'];
        $prices = [0];
    }

    $colors = [];
    $col_lines = preg_split('/\r\n|\r|\n/', trim($in['colors_raw'] ?? ''));
    foreach ($col_lines as $line) {
        $line = trim($line);
        if ($line === '') continue;
        $parts = array_map('trim', explode('|', $line, 2));
        $hex = $parts[1] ?? '#1c1c1f';
        if (!preg_match('/^#[0-9a-fA-F]{6}$/', $hex)) $hex = '#1c1c1f';
        $colors[] = [$parts[0] ?: 'Tiêu chuẩn', $hex];
    }
    if (empty($colors)) {
        $colors = [['Theo yêu cầu', '#1c1c1f']];
    }

    $highlights = array_values(array_filter(array_map('trim', preg_split('/\r\n|\r|\n/', $in['highlights_raw'] ?? ''))));

    $specs = [];
    $spec_lines = preg_split('/\r\n|\r|\n/', trim($in['specs_raw'] ?? ''));
    foreach ($spec_lines as $line) {
        $line = trim($line);
        if ($line === '' || strpos($line, '|') === false) continue;
        list($k, $v) = array_map('trim', explode('|', $line, 2));
        if ($k !== '') $specs[$k] = $v;
    }

    $photos = array_values(array_filter(array_map('trim', explode(',', $in['photos_raw'] ?? ''))));

    $product_data = [
        'id'          => $id,
        'slug'        => $post->post_name ?: roman_slugify($post->post_title),
        'cat'         => $cat,
        'sub'         => $sub,
        'name'        => $post->post_title,
        'nick'        => $nick ?: $post->post_title,
        'tag'         => $tag,
        'unit'        => $unit,
        'short'       => $short,
        'optionLabel' => $optionLabel,
        'options'     => $options,
        'prices'      => $prices,
        'colors'      => $colors,
        'highlights'  => $highlights,
        'specs'       => $specs,
        'photos'      => $photos,
        'autoPrice'   => !empty($in['autoPrice']),
        'hidden'      => ($post->post_status !== 'publish'),
    ];

    update_post_meta($post_id, '_roman_product_json', $product_data);
    update_post_meta($post_id, '_roman_id', $id);
    update_post_meta($post_id, '_roman_cat', $cat);

    wp_set_object_terms($post_id, [$cat], 'roman_cat', false);

    roman_sync_all_to_files();
}, 10, 3);

add_action('trashed_post', function ($post_id) {
    if (get_post_type($post_id) === 'roman_product' || get_post_type($post_id) === 'post') {
        roman_sync_all_to_files();
    }
});

/* ---------- 5. Cột hiển thị & Metabox cho Câu chuyện / Bài viết (`post`) ---------- */
function roman_render_story_metabox($post) {
    wp_nonce_field('roman_save_story', 'roman_story_nonce');
    $photo = get_post_meta($post->ID, '_story_photo', true);
    $pool  = get_post_meta($post->ID, '_story_pool', true);
    $link  = get_post_meta($post->ID, '_story_link', true);
    ?>
    <div class="roman-mb-grid">
        <div class="roman-mb-field">
            <label>Mã ảnh đại diện (Trong <code>/assets/photos/</code>)</label>
            <input type="text" name="roman_story_photo" value="<?php echo esc_attr($photo); ?>" placeholder="VD: ghe-07">
        </div>
        <div class="roman-mb-field">
            <label>Bộ mã ảnh dự phòng (Cách nhau dấu phẩy)</label>
            <input type="text" name="roman_story_pool" value="<?php echo esc_attr($pool); ?>" placeholder="VD: ghe-07, ghe-02">
        </div>
    </div>
    <div class="roman-mb-field">
        <label>Liên kết đích khi bấm vào thẻ Câu chuyện trên Trang chủ</label>
        <input type="text" name="roman_story_link" value="<?php echo esc_attr($link); ?>" placeholder="Để trống nếu muốn mở bài viết chi tiết này, hoặc nhập: support.html#faq, category.html?cat=ghe-da...">
    </div>
    <?php
}

add_action('save_post_post', function ($post_id, $post, $update) {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!isset($_POST['roman_story_nonce']) || !wp_verify_nonce($_POST['roman_story_nonce'], 'roman_save_story')) return;
    if (!current_user_can('edit_post', $post_id)) return;

    update_post_meta($post_id, '_story_photo', sanitize_text_field(wp_unslash($_POST['roman_story_photo'] ?? '')));
    update_post_meta($post_id, '_story_pool', sanitize_text_field(wp_unslash($_POST['roman_story_pool'] ?? '')));
    update_post_meta($post_id, '_story_link', sanitize_text_field(wp_unslash($_POST['roman_story_link'] ?? '')));

    roman_sync_all_to_files();
}, 10, 3);

/* ---------- 6. Quản lý Lịch hẹn (`roman_booking`) ---------- */
function roman_booking_status_labels() {
    return [
        'new'       => ['label' => '🟡 Mới', 'bg' => '#fff8e5', 'color' => '#996800'],
        'contacted' => ['label' => '🔵 Đã liên hệ', 'bg' => '#e5f5fa', 'color' => '#006088'],
        'done'      => ['label' => '🟢 Hoàn thành', 'bg' => '#edfaef', 'color' => '#1b6e2d'],
        'cancelled' => ['label' => '⚪ Đã hủy', 'bg' => '#f0f0f1', 'color' => '#646970'],
    ];
}

add_filter('manage_roman_booking_posts_columns', function ($cols) {
    return [
        'cb'      => $cols['cb'],
        'title'   => 'Khách hàng',
        'phone'   => 'Số điện thoại',
        'car'     => 'Dòng xe',
        'topic'   => 'Hạng mục quan tâm',
        'bdate'   => 'Ngày hẹn thi công',
        'bstatus' => 'Trạng thái',
        'date'    => 'Thời gian gửi',
    ];
});

add_action('manage_roman_booking_posts_custom_column', function ($col, $post_id) {
    if ($col === 'phone') {
        $ph = get_post_meta($post_id, '_booking_phone', true);
        echo '<a href="tel:' . esc_attr(preg_replace('/\s+/', '', $ph)) . '" style="font-weight:700;font-size:14px">' . esc_html($ph) . '</a>';
    } elseif ($col === 'car') {
        echo esc_html(get_post_meta($post_id, '_booking_car', true) ?: '—');
    } elseif ($col === 'topic') {
        echo '<strong>' . esc_html(get_post_meta($post_id, '_booking_topic', true) ?: '—') . '</strong>';
        $msg = get_post_meta($post_id, '_booking_msg', true);
        if ($msg) echo '<br><span style="color:#666;font-size:12px">' . esc_html( wp_trim_words($msg, 12) ) . '</span>';
    } elseif ($col === 'bdate') {
        $d = get_post_meta($post_id, '_booking_date', true);
        echo $d ? esc_html(date_i18n('d/m/Y', strtotime($d))) : '—';
    } elseif ($col === 'bstatus') {
        $st = get_post_meta($post_id, '_booking_status', true) ?: 'new';
        $map = roman_booking_status_labels();
        $info = $map[$st] ?? $map['new'];
        echo '<span style="background:' . esc_attr($info['bg']) . ';color:' . esc_attr($info['color']) . ';padding:4px 10px;border-radius:12px;font-weight:600;font-size:12px;display:inline-block">' . esc_html($info['label']) . '</span>';
    }
}, 10, 2);

function roman_render_booking_metabox($post) {
    wp_nonce_field('roman_save_booking', 'roman_booking_nonce');
    $name   = get_post_meta($post->ID, '_booking_name', true);
    $phone  = get_post_meta($post->ID, '_booking_phone', true);
    $car    = get_post_meta($post->ID, '_booking_car', true);
    $date   = get_post_meta($post->ID, '_booking_date', true);
    $topic  = get_post_meta($post->ID, '_booking_topic', true);
    $msg    = get_post_meta($post->ID, '_booking_msg', true);
    $status = get_post_meta($post->ID, '_booking_status', true) ?: 'new';
    $note   = get_post_meta($post->ID, '_booking_note', true);
    $source = get_post_meta($post->ID, '_booking_source', true) ?: 'web';
    $statuses = roman_booking_status_labels();
    ?>
    <style>
        .roman-bk-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .roman-bk-field { margin-bottom: 14px; }
        .roman-bk-field label { display: block; font-weight: 600; margin-bottom: 5px; }
        .roman-bk-field input, .roman-bk-field select, .roman-bk-field textarea { width: 100%; padding: 8px 10px; border: 1px solid #8c8f94; border-radius: 4px; }
    </style>
    <div class="roman-bk-grid">
        <div class="roman-bk-field">
            <label>Họ và tên khách hàng</label>
            <input type="text" name="bk[name]" value="<?php echo esc_attr($name); ?>">
        </div>
        <div class="roman-bk-field">
            <label>Số điện thoại liên hệ</label>
            <input type="text" name="bk[phone]" value="<?php echo esc_attr($phone); ?>">
        </div>
        <div class="roman-bk-field">
            <label>Hãng và dòng xe</label>
            <input type="text" name="bk[car]" value="<?php echo esc_attr($car); ?>">
        </div>
        <div class="roman-bk-field">
            <label>Ngày dự kiến thi công</label>
            <input type="date" name="bk[date]" value="<?php echo esc_attr($date); ?>">
        </div>
        <div class="roman-bk-field">
            <label>Hạng mục quan tâm</label>
            <input type="text" name="bk[topic]" value="<?php echo esc_attr($topic); ?>">
        </div>
        <div class="roman-bk-field">
            <label>Trạng thái xử lý</label>
            <select name="bk[status]">
                <?php foreach ($statuses as $k => $v): ?>
                    <option value="<?php echo esc_attr($k); ?>" <?php selected($status, $k); ?>><?php echo esc_html($v['label']); ?></option>
                <?php endforeach; ?>
            </select>
        </div>
    </div>
    <div class="roman-bk-field">
        <label>Ghi chú / Yêu cầu của khách hàng</label>
        <textarea name="bk[msg]" rows="3"><?php echo esc_textarea($msg); ?></textarea>
    </div>
    <div class="roman-bk-field">
        <label>Ghi chú nội bộ của Xưởng ROMAN (Khách không thấy)</label>
        <textarea name="bk[note]" rows="3" placeholder="VD: Đã báo giá da Nappa màu Cognac, hẹn 9h sáng thứ Bảy qua xưởng..."><?php echo esc_textarea($note); ?></textarea>
    </div>
    <input type="hidden" name="bk[source]" value="<?php echo esc_attr($source); ?>">
    <?php
}

add_action('save_post_roman_booking', function ($post_id) {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!isset($_POST['roman_booking_nonce']) || !wp_verify_nonce($_POST['roman_booking_nonce'], 'roman_save_booking')) return;
    if (!current_user_can('edit_post', $post_id)) return;

    $bk = wp_unslash($_POST['bk'] ?? []);
    update_post_meta($post_id, '_booking_name', sanitize_text_field($bk['name'] ?? ''));
    update_post_meta($post_id, '_booking_phone', sanitize_text_field($bk['phone'] ?? ''));
    update_post_meta($post_id, '_booking_car', sanitize_text_field($bk['car'] ?? ''));
    update_post_meta($post_id, '_booking_date', sanitize_text_field($bk['date'] ?? ''));
    update_post_meta($post_id, '_booking_topic', sanitize_text_field($bk['topic'] ?? ''));
    update_post_meta($post_id, '_booking_status', sanitize_text_field($bk['status'] ?? 'new'));
    update_post_meta($post_id, '_booking_msg', sanitize_textarea_field($bk['msg'] ?? ''));
    update_post_meta($post_id, '_booking_note', sanitize_textarea_field($bk['note'] ?? ''));
    update_post_meta($post_id, '_booking_source', sanitize_text_field($bk['source'] ?? 'web'));
});

/* ---------- 7. Đồng bộ dữ liệu sang `js/data.js`, `content/site.json`, `sitemap.xml` ---------- */
function roman_price_line($p, $prices) {
    $unit = !empty($p['unit']) ? $p['unit'] : 'bộ';
    $unique = array_unique($prices);
    if (count($unique) === 1) {
        return 'Giá niêm yết ' . roman_fmt_vnd($prices[0]) . '₫ mỗi ' . $unit;
    }
    $opts = $p['options'] ?? [];
    if (count($opts) <= 2) {
        $parts = [];
        foreach ($opts as $i => $o) {
            if (isset($prices[$i])) {
                $parts[] = roman_mb_lcfirst($o) . ' ' . roman_fmt_vnd($prices[$i]) . '₫';
            }
        }
        return 'Giá niêm yết: ' . implode(', ', $parts);
    }
    return 'Giá niêm yết từ ' . roman_fmt_vnd(min($prices)) . '₫ mỗi ' . $unit;
}

function roman_out_product($p, $site) {
    $options = (!empty($p['options']) && is_array($p['options'])) ? array_values($p['options']) : ['Tiêu chuẩn'];
    $raw_prices = (!empty($p['prices']) && is_array($p['prices'])) ? array_slice($p['prices'], 0, count($options)) : [];
    $prices = array_map(function ($n) {
        return max(0, (int) round((float) $n));
    }, $raw_prices);
    $priced = (count($prices) === count($options)) && !in_array(0, $prices, true) && count($prices) > 0;

    $highlights = array_values(array_filter($p['highlights'] ?? []));
    $specs = (isset($p['specs']) && is_array($p['specs'])) ? $p['specs'] : [];

    $o = [
        'id'          => $p['id'],
        'cat'         => $p['cat'],
        'sub'         => $p['sub'] ?? '',
        'name'        => $p['name'],
        'tag'         => $p['tag'] ?? '',
        'short'       => $p['short'] ?? '',
        'colors'      => (!empty($p['colors']) && is_array($p['colors'])) ? $p['colors'] : [['Theo yêu cầu', '#1c1c1f']],
        'optionLabel' => !empty($p['optionLabel']) ? $p['optionLabel'] : 'Tùy chọn',
        'options'     => $options,
        'highlights'  => $highlights,
        'specs'       => (object) $specs,
        'price'       => $priced ? min($prices) : 0,
        'old'         => 0,
        'nick'        => !empty($p['nick']) ? $p['nick'] : $p['name'],
    ];
    if (!empty($p['image'])) {
        $o['image'] = $p['image'];
    }
    if (!empty($p['photos']) && is_array($p['photos'])) {
        $o['photos'] = array_values($p['photos']);
    }
    if ($priced) {
        $o['prices'] = $prices;
        $o['unit'] = !empty($p['unit']) ? $p['unit'] : 'bộ';
        if (($p['autoPrice'] ?? true) !== false) {
            array_unshift($o['highlights'], roman_price_line($o, $prices));
            $price_pairs = [];
            foreach ($options as $i => $opt_label) {
                $price_pairs[] = $opt_label . ': ' . roman_fmt_vnd($prices[$i]) . '₫';
            }
            $hotlines = implode(' · ', array_filter([$site['hotline'] ?? '', $site['hotline2'] ?? '']));
            $merged_specs = array_merge(
                [
                    'Đơn vị tính'  => roman_mb_ucfirst($o['unit']),
                    'Giá niêm yết' => implode(' · ', $price_pairs),
                ],
                $specs,
                ['Liên hệ' => $hotlines]
            );
            $o['specs'] = (object) $merged_specs;
        }
    }
    return $o;
}

function roman_collect_full_content() {
    $data = roman_get_data();
    if (empty($data)) return [];

    // Lấy danh sách sản phẩm từ Custom Post Type roman_product
    $posts = get_posts([
        'post_type'      => 'roman_product',
        'post_status'    => ['publish', 'draft', 'pending', 'private'],
        'posts_per_page' => -1,
        'orderby'        => ['menu_order' => 'ASC', 'ID' => 'ASC'],
    ]);

    if (!empty($posts)) {
        $products = [];
        foreach ($posts as $p_post) {
            $meta = get_post_meta($p_post->ID, '_roman_product_json', true);
            if (is_array($meta) && !empty($meta['id'])) {
                $meta['name'] = $p_post->post_title;
                $meta['slug'] = $p_post->post_name ?: roman_slugify($p_post->post_title);
                $meta['hidden'] = ($p_post->post_status !== 'publish');
                $products[] = $meta;
            }
        }
        if (!empty($products)) {
            $data['products'] = $products;
        }
    }

    // Lấy danh sách câu chuyện (STORIES) từ Bài viết WordPress (post)
    $story_posts = get_posts([
        'post_type'      => 'post',
        'post_status'    => 'publish',
        'posts_per_page' => 20,
        'orderby'        => ['menu_order' => 'ASC', 'date' => 'DESC'],
    ]);
    if (!empty($story_posts)) {
        $stories = [];
        foreach ($story_posts as $sp) {
            $photo = get_post_meta($sp->ID, '_story_photo', true) ?: 'ghe-07';
            $pool_raw = get_post_meta($sp->ID, '_story_pool', true);
            $pool = array_values(array_filter(array_map('trim', explode(',', $pool_raw ?: $photo))));
            $custom_link = get_post_meta($sp->ID, '_story_link', true);
            $link = $custom_link ?: ltrim(wp_make_link_relative(get_permalink($sp->ID)), '/');
            $stories[] = [
                'title' => $sp->post_title,
                'desc'  => $sp->post_excerpt ?: wp_trim_words(wp_strip_all_tags($sp->post_content), 24),
                'link'  => $link,
                'photo' => $photo,
                'pool'  => $pool,
            ];
        }
        if (!empty($stories)) {
            $data['stories'] = $stories;
        }
    }

    return $data;
}

function roman_sync_all_to_files($override_data = null) {
    $c = is_array($override_data) ? $override_data : roman_collect_full_content();
    if (empty($c) || empty($c['site'])) return false;

    $c['rev'] = (int) ($c['rev'] ?? 12) + 1;
    $c['updatedAt'] = gmdate('c');
    update_option('roman_site_data', $c, false);

    // Ghi content/site.json
    $json_flags = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT;
    $site_json_path = roman_site_json_path();
    if (is_dir(dirname($site_json_path))) {
        @file_put_contents($site_json_path, json_encode($c, $json_flags));
    }

    // Sinh js/data.js giống hệt server/build.js
    $site = $c['site'];
    $site['address'] = $site['store'] ?? ($site['address'] ?? '');

    $used_slugs = [];
    $out_products = [];
    foreach (($c['products'] ?? []) as $p) {
        if (!empty($p['hidden'])) continue;
        $base = roman_slugify($p['slug'] ?? ($p['name'] ?? '')) ?: $p['id'];
        $slug = $base;
        $idx = 2;
        while (in_array($slug, $used_slugs, true)) {
            $slug = $base . '-' . ($idx++);
        }
        $used_slugs[] = $slug;
        $prod_obj = roman_out_product($p, $site);
        $prod_obj['url'] = 'san-pham/' . $slug . '/';
        $out_products[] = $prod_obj;
    }

    $parts = [
        ['SITE', $site],
        ['CATEGORIES', $c['categories'] ?? []],
        ['PRODUCTS', $out_products],
        ['HERO_SLIDES', $c['hero'] ?? []],
        ['FEATURES', $c['features'] ?? []],
        ['STORIES', $c['stories'] ?? []],
        ['LIMOUSINE', $c['limousine'] ?? []],
        ['NOTES', $c['notes'] ?? []],
        ['SOCIAL', $c['social'] ?? []],
        ['PHOTO_ALT', $c['photoAlt'] ?? (object) []],
        ['MATERIALS', $c['materials'] ?? []],
        ['PAGES', $c['pages'] ?? (object) []],
        ['CARS', $c['cars'] ?? ['quick' => [], 'brands' => []]],
    ];

    $lines = ["/* TỆP TỰ SINH bởi WordPress ROMAN (/wp-admin). Phiên bản nội dung: " . $c['rev'] . " */"];
    foreach ($parts as $pair) {
        $lines[] = 'const ' . $pair[0] . ' = ' . json_encode($pair[1], $json_flags) . ';';
    }
    $data_js_path = ABSPATH . 'js/data.js';
    if (is_dir(dirname($data_js_path))) {
        @file_put_contents($data_js_path, implode("\n", $lines) . "\n");
    }

    // Cập nhật sitemap.xml & robots.txt
    $base_url = rtrim($site['siteUrl'] ?? home_url(), '/');
    $today = current_time('Y-m-d');
    $urls = [
        ['/', '1.0'],
        ['/category.html', '0.9'],
    ];
    foreach (($c['categories'] ?? []) as $cat) {
        $urls[] = ['/category.html?cat=' . $cat['id'], '0.8'];
    }
    foreach ($out_products as $op) {
        $urls[] = ['/' . $op['url'], '0.8'];
    }
    $urls[] = ['/support.html', '0.7'];
    $urls[] = ['/about.html', '0.6'];
    $urls[] = ['/chinh-sach.html', '0.4'];
    $urls[] = ['/so-do-trang.html', '0.4'];

    $xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
    foreach ($urls as $u) {
        $xml[] = '  <url><loc>' . esc_xml($base_url . $u[0]) . '</loc><lastmod>' . $today . '</lastmod><priority>' . $u[1] . '</priority></url>';
    }
    $xml[] = '</urlset>';
    @file_put_contents(ABSPATH . 'sitemap.xml', implode("\n", $xml) . "\n");

    $robots = "User-agent: *\nAllow: /\nDisallow: /wp-admin/\nDisallow: /admin/\nDisallow: /api/\nDisallow: /product.html\nSitemap: {$base_url}/sitemap.xml\n";
    @file_put_contents(ABSPATH . 'robots.txt', $robots);

    return true;
}

/* ---------- 8. Xử lý API Đặt lịch (`/api/bookings`) & Thống kê (`/api/track`) + Telegram ---------- */
function roman_send_telegram_booking($booking) {
    $tg = get_option('roman_telegram_cfg');
    if (!is_array($tg)) {
        $tg_file = ABSPATH . 'content/telegram.json';
        if (file_exists($tg_file)) {
            $tg = json_decode(file_get_contents($tg_file), true);
            if (is_array($tg)) update_option('roman_telegram_cfg', $tg, false);
        }
    }
    if (empty($tg['enabled']) || empty($tg['token']) || empty($tg['chats'])) {
        return;
    }
    $data = roman_get_data();
    $site_name = $data['site']['name'] ?? 'ROMAN';

    $lines = [
        "🔔 <b>LỊCH HẸN MỚI</b> · " . esc_html($site_name),
        "",
        "👤 <b>" . esc_html($booking['name']) . "</b>",
        "📞 " . esc_html($booking['phone']),
    ];
    if (!empty($booking['car'])) $lines[] = "🚗 " . esc_html($booking['car']);
    if (!empty($booking['date'])) $lines[] = "📅 Ngày dự kiến: " . esc_html(implode('/', array_reverse(explode('-', $booking['date']))));
    if (!empty($booking['topic'])) $lines[] = "🛠 " . esc_html($booking['topic']);
    if (!empty($booking['msg'])) $lines[] = "📝 " . esc_html(mb_substr($booking['msg'], 0, 1000));
    $lines[] = "🕒 Gửi lúc " . wp_date('H:i d/m/Y');
    $lines[] = "";
    $lines[] = "🔗 Quản lý tại: " . admin_url('edit.php?post_type=roman_booking');

    $text = implode("\n", $lines);
    foreach ($tg['chats'] as $chat) {
        $chat_id = is_array($chat) ? ($chat['id'] ?? '') : $chat;
        if (!$chat_id) continue;
        wp_remote_post("https://api.telegram.org/bot{$tg['token']}/sendMessage", [
            'timeout' => 8,
            'headers' => ['Content-Type' => 'application/json'],
            'body'    => json_encode([
                'chat_id'                  => $chat_id,
                'text'                     => $text,
                'parse_mode'               => 'HTML',
                'disable_web_page_preview' => true,
            ]),
        ]);
    }
}

add_action('init', function () {
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);

    // Chuyển hướng trang /admin cũ sang /wp-admin/ của WordPress
    if ($uri === '/admin' || strpos($uri, '/admin/') === 0) {
        wp_redirect(admin_url(), 301);
        exit;
    }

    // API nhận form đặt lịch từ giao diện người dùng: POST /api/bookings
    if ($uri === '/api/bookings' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');

        $raw = file_get_contents('php://input');
        $body = json_decode($raw, true);
        if (!is_array($body)) {
            $body = $_POST;
        }
        // Honeypot chống bot
        if (!empty($body['website'])) {
            echo json_encode(['ok' => true]);
            exit;
        }
        $name  = trim(sanitize_text_field($body['name'] ?? ''));
        $phone = trim(sanitize_text_field($body['phone'] ?? ''));
        $car   = trim(sanitize_text_field($body['car'] ?? ''));
        $date  = trim(sanitize_text_field($body['date'] ?? ''));
        $topic = trim(sanitize_text_field($body['topic'] ?? ''));
        $msg   = trim(sanitize_textarea_field($body['msg'] ?? ''));

        if ($name === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Vui lòng nhập họ tên']);
            exit;
        }
        if (preg_match_all('/\d/', $phone) < 8) {
            http_response_code(400);
            echo json_encode(['error' => 'Số điện thoại chưa đúng']);
            exit;
        }

        $post_id = wp_insert_post([
            'post_type'   => 'roman_booking',
            'post_status' => 'publish',
            'post_title'  => $name . ' — ' . $phone . ($car ? ' (' . $car . ')' : ''),
        ]);

        if ($post_id && !is_wp_error($post_id)) {
            update_post_meta($post_id, '_booking_name', $name);
            update_post_meta($post_id, '_booking_phone', $phone);
            update_post_meta($post_id, '_booking_car', $car);
            update_post_meta($post_id, '_booking_date', preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) ? $date : '');
            update_post_meta($post_id, '_booking_topic', $topic);
            update_post_meta($post_id, '_booking_msg', $msg);
            update_post_meta($post_id, '_booking_status', 'new');
            update_post_meta($post_id, '_booking_source', 'web');
        }

        $booking_item = [
            'id'        => substr(md5((string) $post_id . microtime(true)), 0, 12),
            'wp_id'     => $post_id,
            'createdAt' => gmdate('c'),
            'name'      => $name,
            'phone'     => $phone,
            'car'       => $car,
            'date'      => $date,
            'topic'     => $topic,
            'msg'       => $msg,
            'status'    => 'new',
            'source'    => 'web',
        ];

        // Lưu đồng bộ vào content/bookings.json
        $bk_file = ABSPATH . 'content/bookings.json';
        $bk_list = file_exists($bk_file) ? (json_decode(file_get_contents($bk_file), true) ?: []) : [];
        array_unshift($bk_list, $booking_item);
        if (is_dir(dirname($bk_file))) {
            @file_put_contents($bk_file, json_encode($bk_list, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        }

        roman_send_telegram_booking($booking_item);

        http_response_code(201);
        echo json_encode(['ok' => true, 'id' => $booking_item['id']]);
        exit;
    }

    // API nhận thống kê ẩn danh & sự kiện tìm xe: POST /api/track
    if ($uri === '/api/track' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        http_response_code(204);
        header('Cache-Control: no-store');
        exit;
    }
}, 1);

/* ---------- 9. Trang Quản Trị Tổng Hợp "Cài đặt ROMAN" trong `/wp-admin/` ---------- */
add_action('admin_menu', function () {
    add_menu_page(
        'Cài đặt ROMAN Bespoke Atelier',
        'Cài đặt ROMAN',
        'manage_options',
        'roman-settings',
        'roman_render_settings_page',
        'dashicons-admin-customizer',
        7
    );
});

function roman_render_settings_page() {
    if (!current_user_can('manage_options')) return;

    $notice = '';
    $data = roman_collect_full_content();

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['roman_settings_nonce']) && wp_verify_nonce($_POST['roman_settings_nonce'], 'roman_save_settings')) {
        $tab = sanitize_text_field($_POST['active_tab'] ?? 'store');

        if ($tab === 'store') {
            $s = wp_unslash($_POST['site'] ?? []);
            $data['site']['name']      = sanitize_text_field($s['name'] ?? $data['site']['name']);
            $data['site']['tagline']   = sanitize_text_field($s['tagline'] ?? $data['site']['tagline']);
            $data['site']['hotline']   = sanitize_text_field($s['hotline'] ?? '');
            $data['site']['hotline2']  = sanitize_text_field($s['hotline2'] ?? '');
            $data['site']['email']     = sanitize_email($s['email'] ?? '');
            $data['site']['store']     = sanitize_text_field($s['store'] ?? '');
            $data['site']['address']   = $data['site']['store'];
            $data['site']['warehouse'] = sanitize_text_field($s['warehouse'] ?? '');
            $data['site']['hours']     = sanitize_text_field($s['hours'] ?? '');
            $data['site']['legalName'] = sanitize_text_field($s['legalName'] ?? '');
            $data['site']['taxCode']   = sanitize_text_field($s['taxCode'] ?? '');
            $data['site']['siteUrl']   = esc_url_raw($s['siteUrl'] ?? home_url());

            $soc_raw = wp_unslash($_POST['social'] ?? []);
            $socials = [];
            foreach ($soc_raw as $item) {
                if (!empty($item['name'])) {
                    $socials[] = [
                        'name' => sanitize_text_field($item['name']),
                        'href' => esc_url_raw($item['href'] ?? '#'),
                    ];
                }
            }
            if (!empty($socials)) $data['social'] = $socials;

            $notes_raw = wp_unslash($_POST['notes_raw'] ?? '');
            $data['notes'] = array_values(array_filter(array_map('trim', preg_split('/\r\n|\r|\n/', $notes_raw))));

            roman_sync_all_to_files($data);
            $notice = 'Đã lưu Thông tin cửa hàng & Liên hệ và cập nhật ra website!';
        } elseif ($tab === 'home_json') {
            $hero = json_decode(wp_unslash($_POST['hero_json'] ?? ''), true);
            $features = json_decode(wp_unslash($_POST['features_json'] ?? ''), true);
            $limousine = json_decode(wp_unslash($_POST['limousine_json'] ?? ''), true);
            $categories = json_decode(wp_unslash($_POST['categories_json'] ?? ''), true);

            if (is_array($hero)) $data['hero'] = $hero;
            if (is_array($features)) $data['features'] = $features;
            if (is_array($limousine)) $data['limousine'] = $limousine;
            if (is_array($categories)) $data['categories'] = $categories;

            roman_sync_all_to_files($data);
            $notice = 'Đã lưu cấu hình Trang chủ (Slide Hero, Banner, Limousine & Danh mục) thành công!';
        } elseif ($tab === 'pages_json') {
            $pages = json_decode(wp_unslash($_POST['pages_json'] ?? ''), true);
            $cars  = json_decode(wp_unslash($_POST['cars_json'] ?? ''), true);
            if (is_array($pages)) $data['pages'] = $pages;
            if (is_array($cars)) $data['cars'] = $cars;

            roman_sync_all_to_files($data);
            $notice = 'Đã lưu nội dung các Trang (Giới thiệu, Hỗ trợ, Chính sách) & Danh sách Xe thành công!';
        } elseif ($tab === 'telegram') {
            $tg_in = wp_unslash($_POST['tg'] ?? []);
            $chats = [];
            foreach (preg_split('/\r\n|\r|\n/', trim($tg_in['chats_raw'] ?? '')) as $line) {
                $line = trim($line);
                if ($line === '') continue;
                $parts = array_map('trim', explode('|', $line, 2));
                $chats[] = ['id' => $parts[0], 'name' => $parts[1] ?? 'Quản trị viên'];
            }
            $tg_cfg = [
                'enabled'   => !empty($tg_in['enabled']),
                'token'     => trim(sanitize_text_field($tg_in['token'] ?? '')),
                'chats'     => $chats,
                'publicUrl' => home_url(),
            ];
            update_option('roman_telegram_cfg', $tg_cfg, false);
            @file_put_contents(ABSPATH . 'content/telegram.json', json_encode($tg_cfg, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

            if (!empty($_POST['send_test_tg'])) {
                roman_send_telegram_booking([
                    'name'  => 'Khách hàng thử nghiệm',
                    'phone' => '0927 098 098',
                    'car'   => 'Mercedes-Maybach S450',
                    'date'  => current_time('Y-m-d'),
                    'topic' => 'Bọc ghế da Nappa & Trần sao',
                    'msg'   => 'Tin nhắn kiểm tra kết nối từ WordPress ROMAN (/wp-admin).',
                ]);
                $notice = 'Đã lưu cấu hình Telegram và gửi tin nhắn thử nghiệm!';
            } else {
                $notice = 'Đã lưu cấu hình thông báo Telegram!';
            }
        }
    }

    $active_tab = sanitize_text_field($_GET['tab'] ?? ($_POST['active_tab'] ?? 'store'));
    $site = $data['site'] ?? [];
    $socials = $data['social'] ?? [];
    $tg = get_option('roman_telegram_cfg');
    if (!is_array($tg)) {
        $tg_file = ABSPATH . 'content/telegram.json';
        $tg = file_exists($tg_file) ? (json_decode(file_get_contents($tg_file), true) ?: []) : [];
    }
    $tg_chat_lines = [];
    foreach (($tg['chats'] ?? []) as $c) {
        $tg_chat_lines[] = (is_array($c) ? ($c['id'] . ' | ' . ($c['name'] ?? '')) : $c);
    }
    $json_flags = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT;
    ?>
    <div class="wrap">
        <h1 style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
            <span class="dashicons dashicons-car" style="font-size:28px;width:28px;height:28px;color:#b88a44"></span>
            Quản Trị Hệ Thống ROMAN Bespoke Atelier
        </h1>

        <?php if ($notice): ?>
            <div class="notice notice-success is-dismissible"><p><strong><?php echo esc_html($notice); ?></strong></p></div>
        <?php endif; ?>

        <div style="background:#fff;border:1px solid #ccd0d4;border-left:4px solid #b88a44;padding:12px 16px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
            <div>
                <strong>Lối tắt quản lý nhanh:</strong>
                <a href="<?php echo esc_url(admin_url('edit.php?post_type=roman_product')); ?>" class="button button-secondary" style="margin-left:8px">📦 Quản lý 26 Sản phẩm & Bảng giá</a>
                <a href="<?php echo esc_url(admin_url('edit.php?post_type=roman_booking')); ?>" class="button button-secondary" style="margin-left:6px">📅 Quản lý Lịch hẹn khách hàng</a>
                <a href="<?php echo esc_url(admin_url('edit.php')); ?>" class="button button-secondary" style="margin-left:6px">📰 Quản lý Câu chuyện / Bài viết</a>
            </div>
            <a href="<?php echo esc_url(home_url('/')); ?>" target="_blank" class="button button-primary">🌐 Xem Trang chủ RomanVietnam.com ↗</a>
        </div>

        <h2 class="nav-tab-wrapper">
            <a href="?page=roman-settings&tab=store" class="nav-tab <?php echo $active_tab === 'store' ? 'nav-tab-active' : ''; ?>">1. Thông tin Cửa hàng & Liên hệ</a>
            <a href="?page=roman-settings&tab=home_json" class="nav-tab <?php echo $active_tab === 'home_json' ? 'nav-tab-active' : ''; ?>">2. Trang chủ (Slide, Banner, Limousine & Danh mục)</a>
            <a href="?page=roman-settings&tab=pages_json" class="nav-tab <?php echo $active_tab === 'pages_json' ? 'nav-tab-active' : ''; ?>">3. Trang nội dung & Danh sách Xe</a>
            <a href="?page=roman-settings&tab=telegram" class="nav-tab <?php echo $active_tab === 'telegram' ? 'nav-tab-active' : ''; ?>">4. Thông báo Telegram</a>
        </h2>

        <form method="post" style="background:#fff;padding:22px;border:1px solid #ccd0d4;border-top:none;max-width:1100px">
            <?php wp_nonce_field('roman_save_settings', 'roman_settings_nonce'); ?>
            <input type="hidden" name="active_tab" value="<?php echo esc_attr($active_tab); ?>">

            <?php if ($active_tab === 'store'): ?>
                <table class="form-table">
                    <tr>
                        <th>Tên thương hiệu</th>
                        <td><input type="text" name="site[name]" value="<?php echo esc_attr($site['name'] ?? 'ROMAN'); ?>" class="regular-text"></td>
                    </tr>
                    <tr>
                        <th>Khẩu hiệu (Tagline)</th>
                        <td><input type="text" name="site[tagline]" value="<?php echo esc_attr($site['tagline'] ?? ''); ?>" class="large-text"></td>
                    </tr>
                    <tr>
                        <th>Hotline 1 & Hotline 2</th>
                        <td>
                            <input type="text" name="site[hotline]" value="<?php echo esc_attr($site['hotline'] ?? ''); ?>" placeholder="Hotline chính" class="regular-text">
                            <input type="text" name="site[hotline2]" value="<?php echo esc_attr($site['hotline2'] ?? ''); ?>" placeholder="Hotline phụ" class="regular-text">
                        </td>
                    </tr>
                    <tr>
                        <th>Email liên hệ</th>
                        <td><input type="email" name="site[email]" value="<?php echo esc_attr($site['email'] ?? ''); ?>" class="regular-text"></td>
                    </tr>
                    <tr>
                        <th>Địa chỉ Cửa hàng (Showroom)</th>
                        <td><input type="text" name="site[store]" value="<?php echo esc_attr($site['store'] ?? ''); ?>" class="large-text"></td>
                    </tr>
                    <tr>
                        <th>Địa chỉ Tổng kho</th>
                        <td><input type="text" name="site[warehouse]" value="<?php echo esc_attr($site['warehouse'] ?? ''); ?>" class="large-text"></td>
                    </tr>
                    <tr>
                        <th>Giờ mở cửa</th>
                        <td><input type="text" name="site[hours]" value="<?php echo esc_attr($site['hours'] ?? ''); ?>" class="regular-text"></td>
                    </tr>
                    <tr>
                        <th>Tên pháp lý & Mã số thuế</th>
                        <td>
                            <input type="text" name="site[legalName]" value="<?php echo esc_attr($site['legalName'] ?? ''); ?>" placeholder="Tên công ty / hộ kinh doanh" class="regular-text">
                            <input type="text" name="site[taxCode]" value="<?php echo esc_attr($site['taxCode'] ?? ''); ?>" placeholder="Mã số thuế" class="regular-text">
                        </td>
                    </tr>
                    <tr>
                        <th>Địa chỉ Website (Canonical URL)</th>
                        <td><input type="url" name="site[siteUrl]" value="<?php echo esc_attr($site['siteUrl'] ?? home_url()); ?>" class="regular-text"></td>
                    </tr>
                    <tr>
                        <th>Liên kết Mạng xã hội</th>
                        <td>
                            <?php for ($i = 0; $i < 4; $i++): $soc = $socials[$i] ?? ['name' => '', 'href' => '']; ?>
                                <div style="margin-bottom:8px">
                                    <input type="text" name="social[<?php echo $i; ?>][name]" value="<?php echo esc_attr($soc['name']); ?>" placeholder="Tên (Facebook, Zalo...)" style="width:160px">
                                    <input type="url" name="social[<?php echo $i; ?>][href]" value="<?php echo esc_attr($soc['href']); ?>" placeholder="https://..." style="width:420px">
                                </div>
                            <?php endfor; ?>
                        </td>
                    </tr>
                    <tr>
                        <th>Ghi chú cuối Trang chủ (Mỗi dòng 1 ghi chú)</th>
                        <td>
                            <textarea name="notes_raw" rows="4" class="large-text"><?php echo esc_textarea(implode("\n", $data['notes'] ?? [])); ?></textarea>
                        </td>
                    </tr>
                </table>
                <p class="submit"><button type="submit" class="button button-primary button-large">💾 Lưu Thông tin Cửa hàng & Đồng bộ Web</button></p>

            <?php elseif ($active_tab === 'home_json'): ?>
                <h3>1. Các Slide đầu Trang chủ (<code>HERO_SLIDES</code>)</h3>
                <textarea name="hero_json" rows="10" class="large-text code"><?php echo esc_textarea(json_encode($data['hero'] ?? [], $json_flags)); ?></textarea>

                <h3 style="margin-top:20px">2. Ba khối Banner lớn trên Trang chủ (<code>FEATURES</code>)</h3>
                <textarea name="features_json" rows="12" class="large-text code"><?php echo esc_textarea(json_encode($data['features'] ?? [], $json_flags)); ?></textarea>

                <h3 style="margin-top:20px">3. Khối Thiết kế & Sản xuất Ghế Chủ Tịch Limousine (<code>LIMOUSINE</code>)</h3>
                <textarea name="limousine_json" rows="12" class="large-text code"><?php echo esc_textarea(json_encode($data['limousine'] ?? [], $json_flags)); ?></textarea>

                <h3 style="margin-top:20px">4. Danh sách 6 Danh mục chính (<code>CATEGORIES</code>)</h3>
                <textarea name="categories_json" rows="10" class="large-text code"><?php echo esc_textarea(json_encode($data['categories'] ?? [], $json_flags)); ?></textarea>

                <p class="submit"><button type="submit" class="button button-primary button-large">💾 Lưu cấu hình Trang chủ & Danh mục</button></p>

            <?php elseif ($active_tab === 'pages_json'): ?>
                <h3>1. Nội dung chi tiết các Trang: Giới thiệu (<code>about</code>), Hỗ trợ & FAQ (<code>support</code>), Chính sách (<code>policy</code>)</h3>
                <textarea name="pages_json" rows="18" class="large-text code"><?php echo esc_textarea(json_encode($data['pages'] ?? [], $json_flags)); ?></textarea>

                <h3 style="margin-top:20px">2. Cơ sở dữ liệu các Hãng xe & Dòng xe cho Bộ Tư Vấn Chọn Thảm (<code>CARS</code>)</h3>
                <textarea name="cars_json" rows="14" class="large-text code"><?php echo esc_textarea(json_encode($data['cars'] ?? [], $json_flags)); ?></textarea>

                <p class="submit"><button type="submit" class="button button-primary button-large">💾 Lưu nội dung Trang & Danh sách Xe</button></p>

            <?php elseif ($active_tab === 'telegram'): ?>
                <table class="form-table">
                    <tr>
                        <th>Kích hoạt thông báo Telegram</th>
                        <td>
                            <label>
                                <input type="checkbox" name="tg[enabled]" value="1" <?php checked(!empty($tg['enabled'])); ?>>
                                Tự động bắn thông báo về Telegram ngay khi khách gửi đặt lịch trên website
                            </label>
                        </td>
                    </tr>
                    <tr>
                        <th>Mã Bot Telegram (Bot Token)</th>
                        <td>
                            <input type="text" name="tg[token]" value="<?php echo esc_attr($tg['token'] ?? ''); ?>" class="large-text" placeholder="VD: 123456789:AAH...">
                            <p class="description">Lấy mã từ <code>@BotFather</code> trên Telegram.</p>
                        </td>
                    </tr>
                    <tr>
                        <th>Danh sách Chat ID nhận thông báo (Mỗi dòng: <code>Chat_ID | Tên gợi nhớ</code>)</th>
                        <td>
                            <textarea name="tg[chats_raw]" rows="4" class="large-text" placeholder="123456789 | Anh Tùng Quản lý&#10;-100987654321 | Nhóm Xưởng ROMAN"><?php echo esc_textarea(implode("\n", $tg_chat_lines)); ?></textarea>
                        </td>
                    </tr>
                </table>
                <p class="submit" style="display:flex;gap:12px">
                    <button type="submit" class="button button-primary button-large">💾 Lưu cấu hình Telegram</button>
                    <button type="submit" name="send_test_tg" value="1" class="button button-secondary button-large">📨 Lưu & Gửi tin nhắn thử nghiệm</button>
                </p>
            <?php endif; ?>
        </form>
    </div>
    <?php
}
