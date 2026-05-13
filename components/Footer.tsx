import Link from "next/link";
import { ASSETS } from "@/lib/assetPath";

export default function Footer() {
  return (
    <footer className="bg-base-300 text-base-content">
      <div className="container mx-auto lg:px-50 px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Section */}
          <div>
            <Link 
              href="/" 
              className="flex items-center transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(141,118,209,0.8)] hover:scale-105"
              aria-label="StarMy Home"
            >
              <img
                src={ASSETS.images.icons.logo}
                alt="StarMy Logo"
                width="150"
                height="60"
                className="object-contain"
              />
            </Link>
            <p className="mt-4 text-sm opacity-70 leading-relaxed">
              Malaysia's vibrant VTuber and Artist community. Connect, discover, and create together.
            </p>
          </div>

          {/* Explore Section */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-primary">Explore</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/talents" className="link link-hover text-sm hover:text-primary">
                  Talents
                </Link>
              </li>
              <li>
                <Link href="/artists" className="link link-hover text-sm hover:text-primary">
                  Artists
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="link link-hover text-sm hover:text-primary">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/events" className="link link-hover text-sm hover:text-primary">
                  Events
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Section */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-secondary">Resources</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/about" className="link link-hover text-sm hover:text-secondary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="link link-hover text-sm hover:text-secondary">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="link link-hover text-sm hover:text-secondary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="link link-hover text-sm hover:text-secondary">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="divider my-8"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs opacity-60">
            © {new Date().getFullYear()} StarMyriad. All rights reserved.
          </p>
          <div className="flex gap-3">
            <a href="https://x.com/StarMyriadMY" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm btn-circle hover:text-primary" aria-label="X / Twitter">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2H21l-6.76 7.719L22.5 22h-6.93l-5.43-7.06L3.99 22H1.23l7.26-8.293L1.5 2h7.09l4.95 6.48L18.244 2Zm-1.22 18h1.93L7.53 3.95H5.47L17.024 20Z" />
              </svg>
            </a>
            <a href="https://instagram.com/starmyriadofficial/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm btn-circle hover:text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="https://youtube.com/@starmyriadmyofficial" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm btn-circle hover:text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
