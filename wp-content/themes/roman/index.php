<?php
/**
 * ROMAN Bespoke Atelier - Master Template Router
 * Giữ nguyên 100% thiết kế Luxury, hiệu ứng, SEO JSON-LD và tương thích mọi đường dẫn (.html & permalink WordPress).
 */
if (!defined('ABSPATH')) {
    exit;
}

$data = roman_collect_full_content();
$site = $data['site'] ?? [];
$seo_map = $data['seo'] ?? [];
$rev = (int) ($data['rev'] ?? 12);

$req_path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$req_Trim = trim($req_path, '/');

// Xác định loại trang đang mở
$page_type = 'notfound';
$prod_item = null;
$wp_post_obj = null;
$need_base = false;

if ($req_Trim === '' || $req_Trim === 'index.html' || is_front_page() || is_home()) {
    $page_type = 'home';
} elseif ($req_Trim === 'category.html' || $req_Trim === 'danh-muc' || is_tax('roman_cat')) {
    $page_type = 'category';
    if (is_tax('roman_cat') && empty($_GET['cat'])) {
        $term = get_queried_object();
        if ($term && !empty($term->slug)) {
            $_GET['cat'] = $term->slug;
        }
    }
} elseif ($req_Trim === 'about.html' || $req_Trim === 'gioi-thieu') {
    $page_type = 'about';
} elseif ($req_Trim === 'support.html' || $req_Trim === 'ho-tro') {
    $page_type = 'support';
} elseif ($req_Trim === 'chinh-sach.html' || $req_Trim === 'chinh-sach') {
    $page_type = 'policy';
} elseif ($req_Trim === 'so-do-trang.html' || $req_Trim === 'so-do-trang') {
    $page_type = 'sitemap';
} elseif ($req_Trim === 'product.html') {
    $page_type = 'product';
    $pid = sanitize_text_field($_GET['id'] ?? '');
    foreach (($data['products'] ?? []) as $p) {
        if (($p['id'] ?? '') === $pid) {
            $prod_item = $p;
            break;
        }
    }
} elseif (preg_match('#^san-pham/([^/]+)$#', $req_Trim, $m) || is_singular('roman_product')) {
    $page_type = 'product';
    $need_base = true;
    $slug_look = $m[1] ?? get_post_field('post_name', get_queried_object_id());
    foreach (($data['products'] ?? []) as $p) {
        $p_slug = $p['slug'] ?? roman_slugify($p['name'] ?? '');
        if ($p_slug === $slug_look || ($p['id'] ?? '') === $slug_look) {
            $prod_item = $p;
            break;
        }
    }
    if (!$prod_item) {
        $page_type = 'notfound';
    }
} elseif (is_singular('post')) {
    $page_type = 'post';
    $need_base = true;
    $wp_post_obj = get_queried_object();
} else {
    // Kiểm tra xem có trùng slug bài viết WordPress không
    $maybe_post = get_page_by_path($req_Trim, OBJECT, 'post');
    if ($maybe_post && $maybe_post->post_status === 'publish') {
        $page_type = 'post';
        $need_base = true;
        $wp_post_obj = $maybe_post;
    } else {
        $page_type = 'notfound';
        $need_base = (strpos($req_Trim, '/') !== false);
        http_response_code(404);
    }
}

// Thiết lập tiêu đề, mô tả & canonical theo từng trang
$site_name = $site['name'] ?? 'ROMAN';
$title = $site_name . ' | ' . ($site['tagline'] ?? 'Xưởng Chế Tác & Cá Nhân Hóa Nội Thất Ô Tô Cao Cấp');
$desc = 'ROMAN: ghế da Sumi Fiber, Nappa Fiber, Nappa Fiber Pro, Nappa Clear, ghế điện, sàn ROMAN 360, thảm ROMAN và trần sao. Hệ thống cơ sở tại Hà Nội & TP. Hồ Chí Minh.';
$canonical = '/';
$og_img = '/assets/photos/ghe-04-xl.jpg';
$og_type = 'website';

if ($page_type === 'home') {
    $title = $seo_map['index.html']['title'] ?? $title;
    $desc  = $seo_map['index.html']['description'] ?? $desc;
    $canonical = '/';
} elseif ($page_type === 'category') {
    $title = $seo_map['category.html']['title'] ?? ('Danh mục dịch vụ | ' . $site_name);
    $desc  = $seo_map['category.html']['description'] ?? $desc;
    $canonical = '/category.html';
    $og_img = '/assets/photos/ghe-02-xl.jpg';
} elseif ($page_type === 'about') {
    $title = $seo_map['about.html']['title'] ?? ('Giới thiệu | ' . $site_name);
    $desc  = $seo_map['about.html']['description'] ?? $desc;
    $canonical = '/about.html';
    $og_img = '/assets/photos/xuong-01-xl.jpg';
} elseif ($page_type === 'support') {
    $title = $seo_map['support.html']['title'] ?? ('Hỗ trợ & Đặt lịch thi công | ' . $site_name);
    $desc  = $seo_map['support.html']['description'] ?? $desc;
    $canonical = '/support.html';
    $og_img = '/assets/photos/xuong-01-xl.jpg';
} elseif ($page_type === 'policy') {
    $title = $seo_map['chinh-sach.html']['title'] ?? ('Chính sách bảo hành, bảo mật và điều khoản | ' . $site_name);
    $desc  = $seo_map['chinh-sach.html']['description'] ?? $desc;
    $canonical = '/chinh-sach.html';
} elseif ($page_type === 'sitemap') {
    $title = $seo_map['so-do-trang.html']['title'] ?? ('Sơ đồ trang | ' . $site_name);
    $desc  = $seo_map['so-do-trang.html']['description'] ?? $desc;
    $canonical = '/so-do-trang.html';
} elseif ($page_type === 'product' && $prod_item) {
    $p_slug = $prod_item['slug'] ?? roman_slugify($prod_item['name']);
    $title = $prod_item['name'] . ' | ' . $site_name;
    $prices_clean = array_filter(array_map('intval', $prod_item['prices'] ?? []));
    $price_txt = !empty($prices_clean) ? (' Giá niêm yết từ ' . roman_fmt_vnd(min($prices_clean)) . '₫/' . ($prod_item['unit'] ?? 'bộ') . '.') : '';
    $desc = ($prod_item['short'] ?? $prod_item['name']) . $price_txt . ' Thi công tại ' . $site_name . ', ' . ($site['store'] ?? 'Hà Nội') . '.';
    $canonical = '/san-pham/' . $p_slug . '/';
    $first_ph = $prod_item['photos'][0] ?? 'ghe-02';
    $og_img = '/assets/photos/' . $first_ph . '-lg.jpg';
    $og_type = 'product';
} elseif ($page_type === 'post' && $wp_post_obj) {
    $title = $wp_post_obj->post_title . ' | ' . $site_name;
    $desc = $wp_post_obj->post_excerpt ?: wp_trim_words(wp_strip_all_tags($wp_post_obj->post_content), 28);
    $canonical = '/' . ltrim(wp_make_link_relative(get_permalink($wp_post_obj->ID)), '/');
    $st_photo = get_post_meta($wp_post_obj->ID, '_story_photo', true) ?: 'ghe-07';
    $og_img = '/assets/photos/' . $st_photo . '-lg.jpg';
    $og_type = 'article';
} elseif ($page_type === 'notfound') {
    $title = 'Không tìm thấy trang | ' . $site_name;
    $desc = 'Trang bạn tìm không tồn tại hoặc đã được chuyển.';
}

if ($page_type === 'notfound') {
    status_header(404);
} else {
    status_header(200);
}

$show_admin_bar = is_user_logged_in();
?><!doctype html>
<html lang="vi">
<head>
<base href="<?php echo esc_url(home_url('/')); ?>">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?php echo esc_html($title); ?></title>
<meta name="description" content="<?php echo esc_attr($desc); ?>">
<link rel="icon" type="image/svg+xml" href="/assets/logo-badge.svg">
<link rel="apple-touch-icon" href="/assets/logo-emblem.png">
<meta name="theme-color" content="#f7f5f2">
<meta property="og:site_name" content="<?php echo esc_attr($site_name); ?>">
<meta property="og:locale" content="vi_VN">
<meta property="og:title" content="<?php echo esc_attr($title); ?>">
<meta property="og:description" content="<?php echo esc_attr($desc); ?>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap">
<link rel="stylesheet" href="/css/site.css?v=63">
<!--seo-head-->
<meta name="generator" content="WordPress <?php echo esc_attr(get_bloginfo('version')); ?> - ROMAN Bespoke Atelier">
<?php if ($page_type === 'notfound'): ?>
<meta name="robots" content="noindex">
<?php else: ?>
<link rel="canonical" href="<?php echo esc_attr($canonical); ?>">
<meta property="og:url" content="<?php echo esc_attr($canonical); ?>">
<meta property="og:image" content="<?php echo esc_attr($og_img); ?>">
<meta name="twitter:card" content="summary_large_image">
<?php endif; ?>
<meta property="og:type" content="<?php echo esc_attr($og_type); ?>">
<?php if (in_array($page_type, ['home', 'about', 'support'], true)): ?>
<script type="application/ld+json"><?php echo json_encode([
    '@context'    => 'https://schema.org',
    '@type'       => 'AutoRepair',
    '@id'         => '/#cua-hang',
    'name'        => $site_name,
    'description' => $site['tagline'] ?? '',
    'url'         => '/',
    'image'       => '/assets/photos/xuong-01-xl.jpg',
    'logo'        => '/assets/logo-emblem.png',
    'telephone'   => $site['hotline'] ?? '0964 486 246',

    'address'     => [
        '@type'           => 'PostalAddress',
        'streetAddress'   => '170 Sài Đồng',
        'addressLocality' => 'Long Biên',
        'addressRegion'   => 'Hà Nội',
        'addressCountry'  => 'VN',
    ],
    'priceRange'  => '₫₫',
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); ?></script>
<?php endif; ?>
<?php if ($page_type === 'product' && $prod_item):
    $cat_label = $prod_item['cat'] ?? '';
    foreach (($data['categories'] ?? []) as $c) {
        if ($c['id'] === $cat_label) { $cat_label = $c['name']; break; }
    }
    $p_images = array_map(function ($ph) { return '/assets/photos/' . $ph . '-lg.jpg'; }, $prod_item['photos'] ?? ['ghe-02']);
    $prices_valid = array_filter(array_map('intval', $prod_item['prices'] ?? []));
    $prod_schema = [
        '@context'    => 'https://schema.org',
        '@type'       => 'Product',
        'name'        => $prod_item['name'],
        'description' => $prod_item['short'] ?? '',
        'sku'         => $prod_item['id'],
        'category'    => $cat_label,
        'brand'       => ['@type' => 'Brand', 'name' => $site_name],
        'url'         => $canonical,
        'image'       => $p_images,
    ];
    if (!empty($prices_valid)) {
        $prod_schema['offers'] = [
            '@type'         => 'AggregateOffer',
            'lowPrice'      => min($prices_valid),
            'highPrice'     => max($prices_valid),
            'offerCount'    => count($prices_valid),
            'priceCurrency' => 'VND',
            'availability'  => 'https://schema.org/InStock',
            'url'           => $canonical,
            'seller'        => ['@id' => '/#cua-hang'],
        ];
    }
?>
<script type="application/ld+json"><?php echo json_encode($prod_schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); ?></script>
<?php endif; ?>
<!--/seo-head-->
<?php if ($show_admin_bar): ?>
<style>
  /* Thanh công cụ Quản trị WordPress cho Admin đang đăng nhập */
  .roman-wp-bar {
    background: #141417;
    color: #f5f2eb;
    font-family: "Be Vietnam Pro", sans-serif;
    font-size: 12.5px;
    padding: 7px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(214, 176, 106, 0.3);
    position: relative;
    z-index: 9999;
  }
  .roman-wp-bar a {
    color: #e4c580;
    text-decoration: none;
    font-weight: 600;
    margin-right: 16px;
  }
  .roman-wp-bar a:hover {
    text-decoration: underline;
  }
</style>
<?php endif; ?>
</head>
<body data-page="<?php echo esc_attr($page_type); ?>"<?php if ($page_type === 'product' && $prod_item) echo ' data-id="' . esc_attr($prod_item['id']) . '"'; ?>>
<?php if ($show_admin_bar): ?>
<div class="roman-wp-bar">
  <div>
    <strong style="color:#fff;margin-right:14px">👑 WordPress Admin (<?php echo esc_html(wp_get_current_user()->user_login); ?>):</strong>
    <a href="<?php echo esc_url(admin_url()); ?>">Bảng điều khiển</a>
    <a href="<?php echo esc_url(admin_url('edit.php?post_type=roman_product')); ?>">Sản phẩm & Bảng giá</a>
    <a href="<?php echo esc_url(admin_url('edit.php?post_type=roman_booking')); ?>">Lịch hẹn khách hàng</a>
    <a href="<?php echo esc_url(admin_url('admin.php?page=roman-settings')); ?>">Cài đặt ROMAN</a>
    <?php if ($page_type === 'product' && $prod_item):
        $edit_posts = get_posts(['post_type' => 'roman_product', 'meta_key' => '_roman_id', 'meta_value' => $prod_item['id'], 'posts_per_page' => 1]);
        if (!empty($edit_posts)): ?>
            <a href="<?php echo esc_url(get_edit_post_link($edit_posts[0]->ID)); ?>" style="background:#b88a44;color:#111;padding:3px 10px;border-radius:4px">✎ Sửa sản phẩm này</a>
        <?php endif;
    endif; ?>
  </div>
  <div>
    <a href="<?php echo esc_url(wp_logout_url(home_url($_SERVER['REQUEST_URI'] ?? '/'))); ?>" style="color:#bbb;margin-right:0">Đăng xuất</a>
  </div>
</div>
<?php endif; ?>

<div id="header"></div>

<?php if ($page_type === 'home'): ?>
<main>
  <section class="hero" id="hero" aria-label="Nổi bật"></section>
  <div id="features"></div>
  <section class="rail-sec" id="rec" aria-label="Được đề xuất cho bạn"></section>
  <section class="rail-sec" id="stories" aria-label="Khám phá những câu chuyện"></section>
  <section class="limo-sec" id="limousine" aria-label="Thiết kế và sản xuất ghế chủ tịch Limousine"></section>
  <section class="finder-sec" id="chon-tham" aria-label="Tìm sản phẩm cho xe của bạn"></section>
  <section class="notes" id="notes" aria-label="Ghi chú"></section>
</main>

<?php elseif ($page_type === 'category'): ?>
<main class="wrap">
  <div class="page-head">
    <div class="crumbs" id="crumbs"><a href="./">Trang chủ</a> / Dịch vụ</div>
    <p class="sec-eyebrow">BỘ SƯU TẬP DỊCH VỤ CHẾ TÁC</p>
    <h1 id="title">Bảng giá niêm yết và dịch vụ nội thất ô tô</h1>
  </div>
  <div class="toolbar">
    <div class="chips" id="chips"></div>
    <div style="display:flex;align-items:center;gap:14px">
      <span id="count" style="color:var(--muted);font-size:14px;font-weight:600"></span>
      <select id="sort" aria-label="Sắp xếp">
        <option value="default">Sắp xếp: Mặc định</option>
        <option value="asc">Giá: Thấp đến Cao</option>
        <option value="desc">Giá: Cao đến Thấp</option>
      </select>
    </div>
  </div>
  <div class="grid" id="list"></div>
  <div class="empty" id="empty" hidden>Không tìm thấy dịch vụ phù hợp. <a href="category.html" style="color:var(--accent);text-decoration:underline;font-weight:700">Xem tất cả dịch vụ</a></div>
</main>

<?php elseif ($page_type === 'product'): ?>
<main class="wrap">
  <div class="page-head" style="padding-bottom:0"><div class="crumbs" id="crumbs"></div></div>
  <div class="pd" id="pd">
    <?php if ($prod_item):
      $ph0 = $prod_item['photos'][0] ?? 'ghe-02';
      $alt0 = $data['photoAlt'][$ph0] ?? $prod_item['name'];
    ?>
      <div class="gallery photo"><div class="main"><img src="assets/photos/<?php echo esc_attr($ph0); ?>-lg.jpg" alt="<?php echo esc_attr($alt0); ?>" width="1200" height="900"></div></div>
      <div class="pd-info">
        <h1><?php echo esc_html($prod_item['name']); ?></h1>
        <p class="lead"><?php echo esc_html($prod_item['short'] ?? ''); ?></p>
      </div>
    <?php endif; ?>
  </div>
  <section class="block">
    <p class="sec-eyebrow">GỢI Ý ĐỒNG BỘ KHOANG LÁI</p>
    <h2 class="section-title">Dịch Vụ Phối Hợp Cùng Hạng Mục Này</h2>
    <p class="section-sub">Hoàn thiện đồng bộ màu sắc và chất liệu cho toàn bộ không gian nội thất xe của bạn.</p>
    <div class="grid" id="related"></div>
  </section>
</main>

<?php elseif ($page_type === 'about'): ?>
<main class="wrap"><div id="pageAbout"></div></main>

<?php elseif ($page_type === 'support'): ?>
<main class="wrap"><div id="pageSupport"></div></main>

<?php elseif ($page_type === 'policy'): ?>
<main class="wrap"><div id="pagePolicy"></div></main>

<?php elseif ($page_type === 'sitemap'): ?>
<main class="wrap">
  <div class="page-head">
    <div class="crumbs"><a href="index.html">Trang chủ</a> / Sơ đồ trang</div>
    <p class="sec-eyebrow">TẤT CẢ TRANG</p>
    <h1>Sơ Đồ Trang</h1>
    <p class="cat-lead">Danh sách toàn bộ trang và sản phẩm trên website ROMAN, kèm giá niêm yết.</p>
  </div>
  <div class="sitemap-grid" id="sitemap"></div>
</main>

<?php elseif ($page_type === 'post' && $wp_post_obj):
    $st_photo = get_post_meta($wp_post_obj->ID, '_story_photo', true) ?: 'ghe-07';
?>
<main class="wrap">
  <div class="page-head">
    <div class="crumbs"><a href="index.html">Trang chủ</a> / Câu chuyện chế tác / <?php echo esc_html($wp_post_obj->post_title); ?></div>
    <p class="sec-eyebrow">CÂU CHUYỆN &amp; KINH NGHIỆM NỘI THẤT Ô TÔ</p>
    <h1><?php echo esc_html($wp_post_obj->post_title); ?></h1>
    <?php if ($wp_post_obj->post_excerpt): ?>
      <p class="cat-lead"><?php echo esc_html($wp_post_obj->post_excerpt); ?></p>
    <?php endif; ?>
  </div>
  <article class="policy" style="max-width:860px;margin:0 auto 60px">
    <div style="margin-bottom:32px;border-radius:18px;overflow:hidden">
      <img src="assets/photos/<?php echo esc_attr($st_photo); ?>-xl.jpg" alt="<?php echo esc_attr($wp_post_obj->post_title); ?>" style="width:100%;height:auto;display:block">
    </div>
    <div class="entry-content" style="font-size:16.5px;line-height:1.8">
      <?php echo apply_filters('the_content', $wp_post_obj->post_content); ?>
    </div>
    <div style="margin-top:40px;padding:28px;background:#f2eee8;border-radius:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px">
      <div>
        <h3 style="margin:0 0 6px;font-size:20px">Cần tư vấn trực tiếp cho dòng xe của bạn?</h3>
        <p style="margin:0;color:#555">Liên hệ xưởng chế tác ROMAN để xem mẫu da thực tế và nhận báo giá niêm yết.</p>
      </div>
      <div style="display:flex;gap:12px">
        <a class="btn btn-dark" href="support.html#lien-he">Đặt lịch thi công</a>
        <a class="btn btn-outline" href="category.html">Xem bảng giá</a>
      </div>
    </div>
  </article>
</main>

<?php else: ?>
<main class="wrap">
  <div class="page-head nf">
    <p class="sec-eyebrow">LỖI 404</p>
    <h1>Không Tìm Thấy Trang</h1>
    <p class="cat-lead">Trang bạn tìm không tồn tại hoặc đã được chuyển sang địa chỉ khác.</p>
    <div class="nf-actions">
      <a class="btn btn-dark" href="index.html">Về trang chủ</a>
      <a class="btn btn-outline" href="category.html">Xem bảng giá niêm yết</a>
      <a class="btn btn-outline" href="tel:0964486246">Gọi 0964 486 246</a>
    </div>
  </div>
</main>
<?php endif; ?>

<div id="footer"></div>
<script src="/js/data.js?v=d<?php echo esc_attr($rev); ?>"></script>
<script src="/js/art.js?v=29"></script>
<script src="/js/app.js?v=57"></script>
<?php if ($page_type === 'home'): ?>
<script src="/js/finder.js?v=4"></script>
<?php endif; ?>
</body>
</html>
