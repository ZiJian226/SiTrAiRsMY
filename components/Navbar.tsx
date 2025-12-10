import Link from "next/link";
import { ASSETS } from "@/lib/assetPath";

export default function Navbar() {
  return (
    <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
      <div className="navbar-start lg:flex">
        <div className="dropdown text-5xl">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            <li>
              <Link href="/talents">Talents</Link>
            </li>
            <li>
              <Link href="/artists">Artists</Link>
            </li>
            <li>
              <Link href="/events">Events</Link>
            </li>
            <li>
              <Link href="/gallery">Gallery</Link>
            </li>
            <li>
              <Link href="/community">Community</Link>
            </li>
            <li>
              <details>
                <summary>More</summary>
                <ul>
                  <li><Link href="/store">Store</Link></li>
                  <li><Link href="/about">About Us</Link></li>
                  <li><Link href="/career">Career</Link></li>
                  <li><Link href="/faq">FAQ</Link></li>
                </ul>
              </details>
            </li>
          </ul>
        </div>
      </div>
      <div className="navbar-center ho hidden lg:flex">
        <ul className="menu menu-horizontal items-center md:gap-8 text-xl font-bold">
          <Link
            href="/"
            className="flex items-center transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(141,118,209,0.8)] hover:scale-110"
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
          <Link className="hover:drop-shadow-[0_0_8px_rgba(141,118,209,0.8)] hover:scale-110 duration-300" href="/talents">Talents</Link>
          <Link className="hover:drop-shadow-[0_0_8px_rgba(141,118,209,0.8)] hover:scale-110 duration-300" href="/artists">Artists</Link>
          <Link className="hover:drop-shadow-[0_0_8px_rgba(141,118,209,0.8)] hover:scale-110 duration-300" href="/events">Events</Link>
          <Link className="hover:drop-shadow-[0_0_8px_rgba(141,118,209,0.8)] hover:scale-110 duration-300" href="/gallery">Gallery</Link>
          <Link className="hover:drop-shadow-[0_0_8px_rgba(141,118,209,0.8)] hover:scale-110 duration-300" href="/community">Community</Link>
          <li className="hover:drop-shadow-[0_0_8px_rgba(141,118,209,0.8)] hover:scale-110 duration-300">
            <details >
              <summary>More</summary>
              <ul className="bg-base-100 shadow-lg">
                <li><Link href="/store">Store</Link></li>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/career">Career</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
      <div className="navbar-end hidden lg:flex"> </div>
    </div>
  );
}
