# Portfolio

Personal Angular 22 SSR portfolio for [Athreya M R](https://athreya.codes) — Frontend Architect.

Live site: [https://athreya.codes](https://athreya.codes)

## Stack

- Angular 22 with SSR / prerender (`@angular/ssr`)
- [layers-ui](https://www.npmjs.com/package/layers-ui) design system + Angular Material tooltips
- Firebase Hosting (`portfolio-f2684`)

## Content

Page copy and profile data live in JSON, not hard-coded in components:

| File | Purpose |
|------|---------|
| `src/app/data/me.json` | Name, role, subtitle, email, social links, photo path |
| `src/app/data/seo.json` | Titles, descriptions, Open Graph / Twitter meta, site URL |

SEO is applied via `homeSeoResolver` + `SeoService` on the home route. Static `public/robots.txt` and `public/sitemap.xml` ship with the build.

## Project layout

```
src/app/
  pages/home/          # Live hero (HomeComponent)
  services/            # SeoService, ThemeService
  resolvers/           # home SEO resolver
  data/                # me.json, seo.json
src/styles/            # Tokens, typography, breakpoints, Material overrides
public/                # favicon, images, robots.txt, sitemap.xml
```

## Scripts

```bash
npm start              # ng serve (http://localhost:4200)
npm run start:clean    # clear .angular/cache, then serve
npm run build          # production SSR/prerender build → dist/portfolio
npm run watch          # development build in watch mode
npm run serve:ssr:portfolio  # run the Node SSR server from dist/
```

## Deploy

Push to `main` triggers [`.github/workflows/firebase-deploy.yml`](.github/workflows/firebase-deploy.yml): `npm ci` → `npm run build` → Firebase Hosting deploy of `dist/portfolio/browser`.

Local deploy (requires Firebase CLI auth):

```bash
npm run build
npx firebase deploy --only hosting
```
