# Mystic Crystal Workshop 神秘水晶工坊

A bilingual (English / 繁體中文) crystal shop for Hong Kong, with a cart,
checkout and an admin panel.

- Shop: https://mcwcrystal.com (www redirects to the apex)
- Also reachable at https://crystal.zenithacct.com — kept so older links work
- Admin: https://mcwcrystal.com/admin — one password, no username

## The one idea the whole shop is built on

**A crystal is one physical piece.** There is no variant table and no stock
count: a `crystal_products` row *is* the piece, and its `status` carries the
entire lifecycle.

| status | meaning |
|---|---|
| `active` | on sale |
| `reserved` | someone has ordered it but has not paid yet |
| `sold_out` | paid for and gone |
| `hidden` | not shown in the shop |

Marking an order paid sells its pieces; cancelling or refunding puts them
back on the shelf. Two shoppers cannot buy the same piece: the checkout
reserves with `.eq('status', 'active')`, so the second one loses the update
and gets a clear message instead of an oversell.

Both languages are shown side by side rather than behind a switcher, so every
product needs a Chinese *and* an English name.

## Stack

Next.js 16 (App Router, standalone output) · React 19 · Tailwind v4 ·
framer-motion · Supabase · Stripe · Zustand.

## Data

Everything the shop owner edits lives in the shared self-hosted Supabase at
`supabase.zenithacct.com`, in tables prefixed `crystal_` so they never collide
with the MCW Apple shop or zenith-invoice tables in the same database.

    crystal_collections     series shown as filters on /shop
    crystal_products        one row per physical piece
    crystal_product_images  photos; one is the cover
    crystal_orders          customer, delivery, payment and fulfilment state
    crystal_order_items     names copied in, so history survives edits
    crystal_settings        contact details, shipping, FPS / PayMe

Schema and seed live in `supabase/`. Product photos uploaded from the admin go
to the public `crystal-images` storage bucket.

Only fixed brand copy (name, tagline, philosophy) stays in code, in
`src/lib/data.ts`.

## Environment

    SUPABASE_URL
    SUPABASE_ANON_KEY               reads the catalogue (row level security)
    SUPABASE_SERVICE_ROLE_KEY       server-side writes; never sent to a browser
    ADMIN_PASSWORD                  the admin panel's only credential
    SITE_URL                        used for Stripe return links
    STRIPE_SECRET_KEY               optional — see below

None are named `NEXT_PUBLIC_*` on purpose: nothing in the browser bundle uses
them, and a `NEXT_PUBLIC_` name would be frozen into the build, which happens
inside Docker before the server's environment exists.

## Payment

FPS and PayMe are settled by hand — the shopper is shown where to pay and
sends a screenshot, and the owner marks the order paid in the admin.

Card payment uses Stripe Checkout and **only appears once `STRIPE_SECRET_KEY`
is set**, so the shop never shows a card button that cannot charge anyone.
There is no Stripe webhook: a card payment is confirmed when the shopper
returns to `/checkout/success`. If they close the tab instead, the order stays
pending and the owner settles it from the admin like any other.

## Deploying

Coolify app `ijsk6kr0elsrltp6vb3930fm`. **This repository has no GitHub
webhook**, so pushing does not deploy. Trigger it:

    POST http://localhost:8000/api/v1/deploy?uuid=ijsk6kr0elsrltp6vb3930fm
    Authorization: Bearer <coolify token>
    Host: coolify.zenithacct.com

(Going through `https://coolify.zenithacct.com` from a script is blocked by
Cloudflare; localhost with a `Host` header works.)

Coolify domains must be written with an `http://` scheme — HTTPS is terminated
by the Cloudflare tunnel, and `https://` there causes a redirect loop.

## Local development

    npm install
    npm run dev

Admin login does not work over plain `http://localhost` in a production build:
the session cookie is `Secure`, so the browser refuses to store it. Use
`npm run dev`, or test the admin against the deployed site.
