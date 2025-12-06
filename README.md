# StarMy - VTuber & Artist Community Platform

A modern Next.js community platform connecting VTubers, artists, and fans. Built with Next.js 16, TypeScript, Tailwind CSS, and daisyUI.

## Features

### 🏠 Homepage
- Beautiful hero section with gradient background
- Featured VTubers and Artists sections
- Fully responsive design
- Custom purple and yellow theme

### 🎮 VTuber Directory
- Searchable directory with text filtering
- Tag-based filtering (Gaming, Singing, Art, Tech, etc.)
- Profile pages with social media links
- Placeholder sections for TikTok/Twitch/YouTube embeds

### 🎨 Artist Directory
- Searchable directory with text filtering
- Specialty-based filtering
- Commission status filtering
- Portfolio galleries
- Commission request forms

### 🛠️ Admin Panel
- Manage VTubers and Artists
- Toggle featured status
- Toggle commission availability
- Edit and delete entries
- Tabbed interface for easy navigation

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with daisyUI
- **Theme**: Custom purple (#a855f7) and yellow (#facc15) colors

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
StarMy/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel
│   ├── artists/           # Artist directory and profiles
│   ├── vtubers/           # VTuber directory and profiles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── Container.tsx      # Centered content container
│   └── Navbar.tsx         # Navigation bar
├── data/                  # Mock data
│   └── mockData.ts        # Sample VTubers and Artists
├── lib/                   # Utility functions and types
│   └── types.ts           # TypeScript type definitions
└── public/                # Static assets
```

## Customization

The custom theme is configured in `tailwind.config.ts` with purple and yellow as the primary colors. Mock data is stored in `data/mockData.ts` and can be replaced with database queries or API calls in production.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
