# 🌟 StarMy

**Malaysia's Premier VTuber & Artist Community Platform**

A modern Next.js web application connecting VTubers, digital artists, and fans. Discover talents, explore artwork, attend events, and commission artists all in one place.

---

## 🎯 What is StarMy?

StarMy is a community-driven platform designed to:
- **Showcase Talents** - VTubers and streamers can create profiles, display schedules, and grow their audience
- **Feature Artists** - Digital artists can showcase portfolios and accept commissions
- **Host Events** - Community events, collaborations, and news in one central hub
- **Connect Fans** - Discover new creators and support the Malaysian creative community

---

## 🚀 Quick Start (For New Users)

### Prerequisites
- [Node.js 18+](https://nodejs.org/) installed
- Basic command line knowledge

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/ZiJian226/StarMy.git
   cd StarMy
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   
   Visit [http://localhost:3000](http://localhost:3000)

That's it! The app runs with mock data by default.

---

## 📖 Key Features

### Public Pages
- **Homepage** - Hero banner, recent events, featured artwork
- **Talents** - Browse VTuber profiles with search and tag filters
- **Artists** - Explore artist portfolios and commission status
- **Events** - Latest news, announcements, and community events
- **Gallery** - Curated artwork showcase
- **Store** - Merchandise from talents and artists

### User Dashboard (Login Required)
- **Profile Editor** - Manage your talent/artist profile
- **Merchandise** - Create and manage your products

### Admin Panel (Admin Only)
- **User Management** - View and edit all user accounts
- **Profile Management** - Edit talent and artist profiles with role-specific fields
- **Events Management** - Create and publish events/news
- **Gallery Management** - Curate gallery submissions
- **Merchandise Management** - Approve and manage products
- **Statistics Dashboard** - Platform analytics and metrics

### Demo Accounts
```
Admin:  admin@starmy.com    / password: admin123
Talent: talent@starmy.com   / password: talent123
Artist: artist@starmy.com   / password: artist123
```

---

## � Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, TypeScript
- **Styling**: Tailwind CSS 4, DaisyUI 5
- **Animations**: Framer Motion, AnimeJS
- **State**: React Context (Mock Auth)
- **Database**: Ready for Supabase integration
- **Storage**: Ready for Cloudflare R2 integration

---

## 📁 Project Structure

```
StarMy/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Homepage
│   ├── talents/           # VTuber profiles
│   ├── artists/           # Artist portfolios
│   ├── events/            # News & events
│   ├── gallery/           # Art gallery
│   ├── store/             # Merchandise
│   ├── login/             # Authentication
│   ├── dashboard/         # User dashboard
│   └── admin/             # Admin panel
├── components/            # Reusable components
│   ├── Navbar.tsx        # Navigation bar
│   ├── Footer.tsx        # Footer
│   ├── Container.tsx     # Layout wrapper
│   └── FloatingPoffu.tsx # Mascot animation
├── contexts/              # React Context (Auth)
├── data/                  # Mock data
│   └── mockData.ts       # Sample talents, artists, events
├── lib/                   # Utilities & types
│   └── types.ts          # TypeScript interfaces
└── public/               # Static assets
```

---

## 🎨 Design System

**Color Palette**
- Primary: Purple `#a855f7`
- Secondary: Yellow `#facc15`
- Theme: Dark/Light mode support

**Components**
- Built with DaisyUI component library
- Custom animations and transitions
- Fully responsive mobile-first design

---

## 🔑 Authentication (Mock Mode)

The app currently uses **session-based mock authentication**:
- No real password validation
- Data stored in sessionStorage
- Perfect for development and demo
- Ready for Supabase Auth integration

---

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production (static export)
npm start            # Run production build
npm run lint         # Run ESLint
```

---

## 🌐 Deployment

### GitHub Pages (CI/CD)

This project is configured for automatic deployment to GitHub Pages:

**Live Site**: `https://ZiJian226.github.io/StarMy`

#### Quick Deploy Steps:
1. Push to `main` branch
2. Enable GitHub Pages in Settings → Pages → Source: "GitHub Actions"
3. Wait ~2-5 minutes for deployment
4. Visit your site!

📖 **Detailed Guide**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for full instructions  
⚡ **Quick Reference**: See [QUICK_DEPLOY.md](QUICK_DEPLOY.md) for essential steps

---

## 🚧 Roadmap

- [ ] Supabase database integration
- [ ] Real authentication system
- [ ] Image upload with Cloudflare R2
- [ ] Real-time notifications
- [ ] Advanced search filters
- [ ] Payment integration for commissions
- [ ] Mobile app (React Native)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👥 Contributing

We welcome contributions! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

## 🤝 Support

Need help? 
- Open an issue on [GitHub](https://github.com/ZiJian226/StarMy/issues)
- Check existing issues for solutions

---

## 🌐 Links

- **Repository**: [github.com/ZiJian226/StarMy](https://github.com/ZiJian226/StarMy)
- **Live Demo**: [ZiJian226.github.io/StarMy](https://ZiJian226.github.io/StarMy)
- **Deployment Guide**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Optimization Guide**: [OPTIMIZATION_GUIDE.md](OPTIMIZATION_GUIDE.md)

---

**Built with ❤️ for the Malaysian VTuber & Artist Community**

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
