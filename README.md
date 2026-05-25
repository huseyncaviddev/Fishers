# Fishers — Premium Aquaculture Website

A premium, cinematic website for **Fishers Aquaculture** — a sustainable fish farming company based in Azerbaijan. Built with Next.js 16, React 19, Tailwind CSS 4, and Framer Motion.

## Tech Stack

- **Framework**: Next.js 16.2.6 (App Router, Turbopack)
- **UI**: React 19, Tailwind CSS 4, Framer Motion 12
- **Language**: TypeScript 5
- **Deployment**: Vercel (zero-config)
- **Rendering**: Static Site Generation (SSG) + Client-side interactivity

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with SEO, fonts, structured data
│   ├── page.tsx            # Homepage
│   ├── error.tsx           # Global error boundary
│   ├── not-found.tsx       # Custom 404 page
│   ├── sitemap.ts          # Dynamic sitemap generation
│   ├── about/              # About page
│   ├── contact/            # Contact page
│   ├── gallery/            # Gallery page
│   ├── products/           # Products listing + dynamic [slug] pages
│   └── team/               # Team page
├── components/
│   ├── layout/             # Navbar, Footer
│   ├── sections/           # Page section components
│   └── ui/                 # Reusable UI components
├── data/
│   └── products.ts         # Product data with types
└── lib/                    # Utilities (reserved)
public/
├── images/                 # Optimized images (JPG, AVIF, WebP)
├── videos/                 # MP4 video assets
├── favicon.ico
└── robots.txt
```

## Getting Started

### Prerequisites

- Node.js 18.17+ (recommended: 20 LTS)
- npm 9+

### Installation

```bash
git clone https://github.com/huseyncaviddev/Fishers.git
cd Fishers
npm install
```

### Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values (see `.env.example` for available variables).

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Deployment

### Vercel (Recommended — One Click)

1. Push to GitHub
2. Import the repository at [vercel.com/new](https://vercel.com/new)
3. Vercel auto-detects Next.js — no configuration needed
4. Set environment variables if needed (see `.env.example`)
5. Deploy

The `vercel.json` is pre-configured with:
- Aggressive caching for static assets (images, videos, fonts)
- Security headers (X-Content-Type-Options, X-Frame-Options, CSP)
- Byte-range support for video streaming

### Other Platforms

The project outputs static HTML via SSG. Any platform supporting Next.js will work:

```bash
npm run build
# Output in .next/ directory
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Create production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Key Features

- **Cinematic Hero**: Scroll-driven video carousel with parallax, crossfade transitions
- **Video Optimization**: Lazy loading, poster images, pause-when-offscreen
- **Performance**: Static generation, image optimization (AVIF/WebP), font subsetting
- **SEO**: Structured data (JSON-LD), OpenGraph, Twitter cards, dynamic sitemap, robots.txt
- **Responsive**: Mobile-first design, tested across breakpoints
- **Animations**: GPU-accelerated Framer Motion transitions, smooth scroll
- **Accessibility**: Semantic HTML, ARIA labels, focus-visible states, keyboard navigation
- **Security**: Security headers, no exposed secrets, input validation

## Performance Targets

- Lighthouse Performance: 90+
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Total Blocking Time: < 200ms

## Troubleshooting

### Videos not loading in development
Videos are served from `/public/videos/`. Ensure the files exist:
```bash
ls public/videos/
# Should show: farm-1.mp4 through farm-5.mp4, ras-system.mp4
```

### Build fails with memory error
Increase Node.js memory:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Fonts not loading
The project uses Google Fonts (Playfair Display, DM Sans) via `next/font`. They are self-hosted automatically — no external requests in production.

### Hydration mismatch
The `suppressHydrationWarning` prop is used on the copyright year. If you see other hydration warnings, check for browser extensions that modify the DOM.

## License

Proprietary. All rights reserved.
