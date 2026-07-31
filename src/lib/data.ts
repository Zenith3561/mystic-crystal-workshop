export const brand = {
  nameEn: 'Mystic Crystal Workshop',
  nameZh: '神秘水晶工坊',
  taglineEn: 'Where Nature Becomes Art',
  taglineZh: '自然之美，渾然天成',
  whatsapp: '85212345678', // TODO: 客戶真實號碼
  email: 'hello@mysticcrystal.hk', // TODO
}

export type Collection = {
  slug: string
  nameEn: string
  nameZh: string
  descEn: string
  descZh: string
}

export const collections: Collection[] = [
  {
    slug: 'poetry-of-light',
    nameEn: 'the poetry of light',
    nameZh: '光影之詩',
    descEn: 'Crystals that catch and play with light — moonstone, labradorite, rainbow fluorite.',
    descZh: '捕捉光線嘅水晶——月亮石、拉長石、彩虹螢石。',
  },
  {
    slug: 'earths-origin',
    nameEn: "the earth's origin",
    nameZh: '原初大地',
    descEn: 'Raw geodes and clusters, shaped by the earth over millions of years.',
    descZh: '原礦晶簇與晶洞，億萬年大地孕育而成。',
  },
  {
    slug: 'everyday-sanctuary',
    nameEn: 'everyday sanctuary',
    nameZh: '日常隨身',
    descEn: 'Palm stones and tumbled crystals to carry calm through your day.',
    descZh: '手把件與滾石，讓平靜隨身同行。',
  },
]

export type Product = {
  id: string
  nameEn: string
  nameZh: string
  priceHkd: number
  collection: string
  image: string
  isNew?: boolean
  featured?: boolean
}

export const products: Product[] = [
  { id: 'amethyst-geode', nameEn: 'Amethyst Geode Cave', nameZh: '紫水晶晶洞', priceHkd: 1280, collection: 'earths-origin', image: '/images/amethyst-geode.png', isNew: true, featured: true },
  { id: 'rose-quartz-sphere', nameEn: 'Rose Quartz Sphere', nameZh: '粉晶球', priceHkd: 428, collection: 'poetry-of-light', image: '/images/rose-quartz-sphere.png', isNew: true, featured: true },
  { id: 'citrine-tower', nameEn: 'Citrine Cluster Tower', nameZh: '黃水晶晶簇塔', priceHkd: 668, collection: 'earths-origin', image: '/images/citrine-tower.png', isNew: true },
  { id: 'moonstone-palm', nameEn: 'Strong Flash Moonstone Palm Stone', nameZh: '強藍光月亮石手把', priceHkd: 252, collection: 'everyday-sanctuary', image: '/images/moonstone-palm.png', isNew: true, featured: true },
  { id: 'clear-quartz-points', nameEn: 'Clear Quartz Points Bundle', nameZh: '白水晶柱套裝', priceHkd: 188, collection: 'everyday-sanctuary', image: '/images/clear-quartz-points.png' },
  { id: 'fluorite-tower', nameEn: 'Green Fluorite Tower', nameZh: '綠螢石塔', priceHkd: 348, collection: 'poetry-of-light', image: '/images/fluorite-tower.png', featured: true },
  { id: 'amethyst-mini', nameEn: 'Amethyst Cluster (Mini)', nameZh: '紫水晶簇（小）', priceHkd: 168, collection: 'earths-origin', image: '/images/amethyst-geode.png' },
  { id: 'moonstone-pair', nameEn: 'Moonstone Palm Stone Pair', nameZh: '月亮石手把一對', priceHkd: 468, collection: 'everyday-sanctuary', image: '/images/moonstone-palm.png' },
]

export const philosophy = [
  {
    titleEn: 'Pure & Natural',
    titleZh: '純淨天然',
    bodyEn: 'No rituals, no myths. Only the pure beauty of nature, honestly sourced.',
    bodyZh: '不談儀式與傳說，只呈現大自然最純粹的美。',
  },
  {
    titleEn: 'Hand Selected',
    titleZh: '親手挑選',
    bodyEn: 'Every piece is chosen by hand for its clarity, colour and character.',
    bodyZh: '每一件都經人手挑選，只留低通透、色澤與個性兼備之作。',
  },
  {
    titleEn: 'Hong Kong Based',
    titleZh: '香港本地',
    bodyEn: 'Local delivery across Hong Kong, carefully packed with love.',
    bodyZh: '香港本地發貨，每件細心包裝送到你手上。',
  },
]

export const formatPrice = (p: number) => `HK$${p.toLocaleString('en-HK')}`
