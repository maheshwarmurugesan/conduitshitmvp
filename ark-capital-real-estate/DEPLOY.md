# Deploy ARK Capital Real Estate to Vercel

## See the site locally (in Cursor)

1. Open a terminal in Cursor (Terminal → New Terminal).
2. Go to the project folder and start the dev server:

   ```bash
   cd ark-capital-real-estate
   npm run dev
   ```

3. In your browser, open: **http://localhost:3000**

   You’ll see the site. Edits to the code will refresh the page automatically.

---

## Deploy to Vercel (no coding)

### Option A: Deploy from your computer (easiest)

1. Create a free account at [vercel.com](https://vercel.com) (sign in with GitHub if you use it).
2. Install the Vercel CLI once (optional but simple):

   ```bash
   npm i -g vercel
   ```

3. From the project folder, run:

   ```bash
   cd ark-capital-real-estate
   vercel
   ```

4. Follow the prompts:
   - Log in if asked.
   - Accept the default project settings (just press Enter).
5. When it finishes, you’ll get a URL like `https://ark-capital-real-estate-xxx.vercel.app`. Open it to see your live site.

### Option B: Deploy from GitHub

1. Push this project to a GitHub repo (e.g. create a repo and push the `ark-capital-real-estate` folder).
2. Go to [vercel.com](https://vercel.com) and sign in.
3. Click **Add New…** → **Project**.
4. Import your GitHub repo (e.g. `ark-capital-real-estate`).
5. Leave the settings as they are and click **Deploy**.
6. Every time you push to the main branch, Vercel will automatically redeploy.

---

## Updating the site

- **Locally:** Change files in `src/` (e.g. `src/app/page.tsx`, `src/components/About.tsx`). Save and refresh the browser if the dev server is running.
- **Live site:** If you used Option B (GitHub), push your changes and Vercel will update. If you used Option A (CLI), run `vercel --prod` from the project folder to update production.
