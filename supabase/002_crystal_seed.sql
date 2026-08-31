-- Seed: the collections and demo pieces that used to be hard-coded in
-- src/lib/data.ts. Prices and photos are still the demo ones; the shop
-- owner replaces them from the admin.
insert into crystal_collections (slug, name_en, name_zh, desc_en, desc_zh, sort_order) values
 ('poetry-of-light',    'The Poetry of Light', '光影之詩',
  'Crystals that catch and play with light — moonstone, labradorite, rainbow fluorite.',
  '捕捉光線嘅水晶——月亮石、拉長石、彩虹螢石。', 1),
 ('earths-origin',      'The Earth''s Origin', '原初大地',
  'Raw geodes and clusters, shaped by the earth over millions of years.',
  '原礦晶簇與晶洞，億萬年大地孕育而成。', 2),
 ('everyday-sanctuary', 'Everyday Sanctuary', '日常隨身',
  'Palm stones and tumbled crystals to carry calm through your day.',
  '手把件與滾石，讓平靜隨身同行。', 3)
on conflict (slug) do nothing;

insert into crystal_products
 (slug, name_en, name_zh, collection_slug, price_hkd, is_new, featured, sort_order) values
 ('amethyst-geode',      'Amethyst Geode Cave',                '紫水晶晶洞',     'earths-origin',      1280, true,  true,  1),
 ('rose-quartz-sphere',  'Rose Quartz Sphere',                 '粉晶球',         'poetry-of-light',     428, true,  true,  2),
 ('citrine-tower',       'Citrine Cluster Tower',              '黃水晶晶簇塔',   'earths-origin',       668, true,  false, 3),
 ('moonstone-palm',      'Strong Flash Moonstone Palm Stone',  '強藍光月亮石手把','everyday-sanctuary',  252, true,  true,  4),
 ('clear-quartz-points', 'Clear Quartz Points Bundle',         '白水晶柱套裝',   'everyday-sanctuary',  188, false, false, 5),
 ('fluorite-tower',      'Green Fluorite Tower',               '綠螢石塔',       'poetry-of-light',     348, false, true,  6),
 ('amethyst-mini',       'Amethyst Cluster (Mini)',            '紫水晶簇（小）', 'earths-origin',       168, false, false, 7),
 ('moonstone-pair',      'Moonstone Palm Stone Pair',          '月亮石手把一對', 'everyday-sanctuary',  468, false, false, 8)
on conflict (slug) do nothing;

insert into crystal_product_images (product_id, url, is_primary, sort_order)
select p.id, i.url, true, 0
from (values
 ('amethyst-geode',      '/images/amethyst-geode.png'),
 ('rose-quartz-sphere',  '/images/rose-quartz-sphere.png'),
 ('citrine-tower',       '/images/citrine-tower.png'),
 ('moonstone-palm',      '/images/moonstone-palm.png'),
 ('clear-quartz-points', '/images/clear-quartz-points.png'),
 ('fluorite-tower',      '/images/fluorite-tower.png'),
 ('amethyst-mini',       '/images/amethyst-geode.png'),
 ('moonstone-pair',      '/images/moonstone-palm.png')
) as i(slug, url)
join crystal_products p on p.slug = i.slug
where not exists (select 1 from crystal_product_images x where x.product_id = p.id);

insert into crystal_settings (key, value) values
 ('brand_name_en',      'Mystic Crystal Workshop'),
 ('brand_name_zh',      '神秘水晶工坊'),
 ('whatsapp_number',    ''),
 ('contact_email',      ''),
 ('free_shipping_over', '500'),
 ('shipping_flat_hkd',  '30'),
 ('fps_id',             ''),
 ('payme_link',         ''),
 ('bank_note_zh',       ''),
 ('bank_note_en',       '')
on conflict (key) do nothing;
