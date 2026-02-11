# ARK Capital Real Estate

Website for Ark Capital Real Estate — single-family and multifamily residential real estate across Southern California.

## See the site while you build

```bash
npm run dev
```

Then open **http://localhost:3000** in your browser. The page updates automatically when you edit files.

## Hero video (landing page background)

The hero uses an **auto-playing video** background. To show a birds-eye view of a neighborhood:

1. Add an MP4 file at **`public/videos/hero.mp4`** (e.g. aerial/drone footage of an Orange County neighborhood).
2. Keep the file size reasonable (e.g. under 10MB) for fast loading.

If no file is present, the hero still displays the headline with a gradient overlay.

## Deploy to Vercel

See **[DEPLOY.md](./DEPLOY.md)** for step-by-step instructions (no coding required).

## Project structure

- `src/app/page.tsx` — main page (assembles all sections)
- `src/components/` — Header (with logo), Hero (video), About, Strategy, Portfolio, Our Team, Contact, Footer
- `public/images/` — `zach-agranovich.png`
- `public/videos/` — add `hero.mp4` for the landing page video

To change copy or add Lucca’s photo, edit the component files in `src/components/`.
