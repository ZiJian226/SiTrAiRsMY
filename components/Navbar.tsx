"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ASSETS } from "@/lib/assetPath";
import { MusicToggle } from "./MusicToggle";

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [blurProgress, setBlurProgress] = useState(0);
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const navbarBgOpacity = isHomepage ? blurProgress : 1;

  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // Listen to CSS variable for homepage blur progress (only on homepage)
  useEffect(() => {
    if (!isHomepage) {
      setBlurProgress(0);
      return;
    }

    const updateBlurProgress = () => {
      const progress = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hero-blur-progress') || '0');
      setBlurProgress(progress);
    };

    const observer = new MutationObserver(updateBlurProgress);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    window.addEventListener('scroll', updateBlurProgress, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateBlurProgress as EventListener);
    };
  }, [isHomepage]);

  const navItems = [
    { label: "Talents", href: "/talents" },
    { label: "Artists", href: "/artists" },
    { label: "Staffs", href: "/staffs" },
    { label: "Events", href: "/events" },
    { label: "Gallery", href: "/gallery" },
    { label: "Community", href: "/community" },
  ];

  const moreItems = [
    { label: "About Us", href: "/about" },
    { label: "Join Us", href: "/joinus" },
    { label: "FAQ", href: "/faq" },
  ];

  return (
    <>
      <div 
        className="navbar shadow-lg sticky top-0 z-50 lg:min-h-25 transition-colors duration-300 relative overflow-visible"
        style={{
          backdropFilter: (isHomepage && blurProgress > 0) || !isHomepage ? 'blur(10px)' : 'none'
        }}
      >
        <div
          className="absolute inset-0 bg-base-100 pointer-events-none transition-opacity duration-300"
          style={{ opacity: navbarBgOpacity }}
          aria-hidden="true"
        />
        {/* ===== MOBILE: Hamburger (visible only on mobile) ===== */}
        <div className="navbar-start flex-1 relative z-10">
          <div className="hidden lg:block w-auto" aria-hidden="true"></div>
          <button
            className="btn btn-ghost text-2xl lg:hidden"
            onClick={toggleSidebar}
            aria-label="Menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </button>
          <Link
              href="/"
              className="flex items-center lg:hidden transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(141,118,209,0.8)]"
              aria-label="StarMy Home"
            >
              <img
                src={ASSETS.images.icons.logo}
                alt="StarMy Logo"
                width="100"
                height="48"
                className="object-contain"
              />
            </Link>
        </div>

        {/* ===== DESKTOP: Horizontal menu (visible only on desktop) ===== */}
        <div className="navbar-center hidden lg:flex lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2 relative z-10">
          <ul className="menu menu-horizontal flex-nowrap whitespace-nowrap items-center gap-2 xl:gap-4 2xl:gap-6 text-lg 2xl:text-xl font-bold">
            <Link
              href="/"
              className="flex items-center transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(141,118,209,0.8)]"
              aria-label="StarMy Home"
            >
              <img
                src={ASSETS.images.icons.logo}
                alt="StarMy Logo"
                width="100"
                height="48"
                className="object-contain"
              />
            </Link>
            <Link
              className="px-1 hover:drop-shadow-[0_0_8px_rgba(141,118,209,0.8)] hover:scale-110 duration-300"
              href="/talents"
            >
              Talents
            </Link>
            <Link
              className="px-1 hover:drop-shadow-[0_0_8px_rgba(141,118,209,0.8)] hover:scale-110 duration-300"
              href="/artists"
            >
              Artists
            </Link>
            <Link
              className="px-1 hover:drop-shadow-[0_0_8px_rgba(141,118,209,0.8)] hover:scale-110 duration-300"
              href="/staffs"
            >
              Staffs
            </Link>
            <Link
              className="px-1 hover:drop-shadow-[0_0_8px_rgba(141,118,209,0.8)] hover:scale-110 duration-300"
              href="/events"
            >
              Events
            </Link>
            <Link
              className="px-1 hover:drop-shadow-[0_0_8px_rgba(141,118,209,0.8)] hover:scale-110 duration-300"
              href="/gallery"
            >
              Gallery
            </Link>
            <Link
              className="px-1 hover:drop-shadow-[0_0_8px_rgba(141,118,209,0.8)] hover:scale-110 duration-300"
              href="/community"
            >
              Community
            </Link>
            <li className="hover:drop-shadow-[0_0_8px_rgba(141,118,209,0.8)] hover:scale-110 duration-300">
              <details>
                <summary>More</summary>
                <ul className="bg-base-100 shadow-lg">
                  <li><Link href="/about">About Us</Link></li>
                  <li><Link href="/joinus">Join Us</Link></li>
                  <li><Link href="/faq">FAQ</Link></li>
                </ul>
              </details>
            </li>
          </ul>
        </div>

        {/* ===== MusicToggle: visible on both mobile and desktop (right side) ===== */}
        <div className="navbar-end lg:flex-none lg:ml-auto relative z-10 pointer-events-none">
          <MusicToggle />
        </div>
      </div>

      {/* ===== MOBILE SIDEBAR (only appears when hamburger is clicked) ===== */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 lg:hidden ${
          isSidebarOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            isSidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeSidebar}
        />
        <div
          className={`absolute left-0 top-0 h-full w-72 bg-base-100 shadow-2xl transition-transform duration-300 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-base-200">
            <img
              src={ASSETS.images.icons.logo}
              alt="StarMy Logo"
              width="80"
              height="38"
              className="object-contain"
            />
            <button
              className="btn btn-ghost btn-sm"
              onClick={closeSidebar}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
          <ul className="menu menu-lg p-4 pt-2 gap-1 text-base font-semibold">
            {navItems.map((item) => (
              <li key={item.href} onClick={closeSidebar}>
                <Link href={item.href} className="py-3 px-4 rounded-lg block">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <details>
                <summary className="py-3 px-4 rounded-lg">More</summary>
                <ul className="ml-4 mt-1">
                  {moreItems.map((item) => (
                    <li key={item.href} onClick={closeSidebar}>
                      <Link href={item.href} className="py-2 px-4 rounded-lg block">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          </ul>
          <div className="absolute bottom-6 left-0 w-full px-4">
            <div className="flex justify-center">
              <MusicToggle />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}