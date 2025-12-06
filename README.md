# 🌟 StarMy (StarMyriad)

**Malaysia's Premier VTuber & Artist Community Platform**

StarMy is a comprehensive Next.js web application designed to connect VTubers, digital artists, and fans in Malaysia. The platform provides discovery, showcasing, and collaboration opportunities for the creative community.

## 🎨 Design Theme

- **Main Colors**: Purple (#a855f7), Yellow (#facc15)
- **Secondary Colors**: Dark, White
- **Framework**: Next.js 16, DaisyUI, TailwindCSS 4
- **Animations**: AnimeJS
- **Database**: Supabase (PostgreSQL)
- **Media Storage**: Cloudflare R2

## ✨ Features

### Main Website Flow
- ✅ **Homepage** - Hero section with featured VTubers and Artists
- ✅ **News Page** - Community news and announcements with category filtering
- ✅ **VTubers Directory** - Searchable list with tag filtering
- ✅ **VTuber Profiles** - Individual profiles with streaming schedules, social links, TikTok/Twitch/YouTube placeholders
- ✅ **Artists Directory** - Searchable list with specialty and commission status filtering
- ✅ **Artist Profiles** - Portfolio showcase with commission request forms
- ✅ **About Us** - Company information, mission, values, and team
- ✅ **Career Page** - Application forms for VTubers, Artists, and Team positions
- ✅ **FAQ** - Comprehensive frequently asked questions
- ✅ **Privacy Policy** - Detailed privacy information
- ✅ **Terms of Service** - Legal terms and conditions
- ✅ **Loading States** - Custom loading page with animations
- ✅ **Error Pages** - Custom error and 404 pages

### Admin Flow (Separate Authentication)
- ✅ **Admin Login/Register** - Authentication pages with validation
- ✅ **Admin Dashboard** - Statistics and quick actions overview
- 🚧 **VTuber Management** - Full CRUD for VTuber profiles
- 🚧 **Artist Management** - Full CRUD for artist profiles
- 🚧 **News Management** - Create, edit, and publish news articles
- 🚧 **Application Review** - Review career applications
- 🚧 **Commission Management** - View and manage commission requests

### Layout Features
- ✅ Sticky top navigation bar with dropdown menus
- ✅ Horizontally centered content with Container component
- ✅ Standardized footer across all pages
- ✅ Fully responsive mobile design
- ✅ Smooth scroll animations with AnimeJS

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for database)
- Cloudflare R2 account (for media storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ZiJian226/StarMy.git
   cd StarMy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.local.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.local.example .env.local
   ```

   Required environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - `R2_ACCOUNT_ID` - Cloudflare R2 account ID
   - `R2_ACCESS_KEY_ID` - R2 access key
   - `R2_SECRET_ACCESS_KEY` - R2 secret key
   - `R2_BUCKET_NAME` - R2 bucket name

4. **Set up the database**
   
   Follow the instructions in `DATABASE_SCHEMA.md` to set up your Supabase database

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
StarMy/
├── app/                      # Next.js app directory
│   ├── about/               # About Us page
│   ├── admin/               # Admin pages (login, dashboard)
│   ├── artists/             # Artists directory and profiles
│   ├── career/              # Career/Join Us page
│   ├── faq/                 # FAQ page
│   ├── news/                # News listing page
│   ├── privacy/             # Privacy Policy page
│   ├── terms/               # Terms of Service page
│   ├── vtubers/             # VTubers directory and profiles
│   ├── error.tsx            # Error boundary page
│   ├── layout.tsx           # Root layout
│   ├── loading.tsx          # Loading state
│   ├── not-found.tsx        # 404 page
│   └── page.tsx             # Homepage
├── components/              # Reusable components
│   ├── AnimatedSection.tsx  # Animation wrapper component
│   ├── Container.tsx        # Content container wrapper
│   ├── Footer.tsx           # Site footer
│   └── Navbar.tsx           # Navigation bar
├── data/                    # Mock data (will be replaced with Supabase)
│   └── mockData.ts          # VTubers and Artists data
├── lib/                     # Utility libraries
│   ├── animations.ts        # AnimeJS animation helpers
│   ├── supabase.ts          # Supabase client configuration
│   └── types.ts             # TypeScript type definitions
├── public/                  # Static assets
├── .env.local.example       # Environment variables template
├── DATABASE_SCHEMA.md       # Database schema documentation
├── package.json             # Project dependencies
├── tailwind.config.ts       # Tailwind configuration
└── tsconfig.json            # TypeScript configuration
```

## 🎯 Roadmap

### Phase 1: MVP (Current)
- [x] Basic website structure
- [x] VTuber and Artist directories
- [x] Static pages (About, FAQ, Career, etc.)
- [x] Admin authentication UI
- [x] Schedule feature for VTubers
- [x] Animation utilities

### Phase 2: Database Integration
- [ ] Connect Supabase for all data
- [ ] Implement full CRUD in admin panel
- [ ] User authentication with Supabase Auth
- [ ] File uploads to Cloudflare R2
- [ ] Real-time updates

### Phase 3: Enhanced Features
- [ ] Actual TikTok/Twitch/YouTube embeds
- [ ] Live streaming status indicators
- [ ] Email notifications for commissions
- [ ] Payment integration for commissions
- [ ] Advanced search and filtering

## 🛠️ Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: TailwindCSS 4, DaisyUI 5
- **Animations**: AnimeJS
- **Database**: Supabase (PostgreSQL)
- **Storage**: Cloudflare R2
- **Deployment**: Vercel (recommended)
├── lib/                   # Utility functions and types
│   └── types.ts           # TypeScript type definitions
└── public/                # Static assets
```

## Customization

The custom theme is configured in `tailwind.config.ts` with purple and yellow as the primary colors. Mock data is stored in `data/mockData.ts` and can be replaced with database queries or API calls in production.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
