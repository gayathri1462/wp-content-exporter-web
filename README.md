# WP Content Exporter — web UI

Simple Next.js app to preview and download CSV exports from WordPress endpoints.

Quick start

```bash
# install
npm install

# dev
npm run dev
```

Run tests

```bash
npm run test
```

Build

```bash
npm run build
```

Features

- Fetch CSV from public or Bearer-protected endpoints
- Upload CSV file for preview
- Column toggle and preview (first 50 rows)
- Download selected columns as CSV

Deployment

1. Push to GitHub (create repo `wp-content-exporter-web`)
2. Import the repo in Vercel — Next.js is auto-detected

CI & GitHub

Add a GitHub Actions workflow to run `npm run build` and `npm run test` on PRs. Vercel will handle deployment when you connect the repo.

Push to GitHub

```bash
# create repo on GitHub (replace <username>)
git remote add origin https://github.com/<username>/wp-content-exporter-web.git
git branch -M main
git push -u origin main
```

Deploy to Vercel

1. Go to https://vercel.com and import your GitHub repo.
2. Framework should auto-detect Next.js; leave defaults and deploy.
3. Add any environment variables (none required for public endpoints).

If you want me to push the repo for you, provide the GitHub repo URL and I'll push the `main` branch.

Notes

- Provide your WP endpoint that returns CSV (or use the upload button)
- Keep auth tokens secure; the app sends the token only to the configured endpoint
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
