import Link from "next/link";

export default function Navbar() {
  return (
    <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
      <div className="navbar-start hidden lg:flex">
        <div className="dropdown">
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
              <Link href="/vtubers">VTubers</Link>
            </li>
            <li>
              <Link href="/artists">Artists</Link>
            </li>
            <li>
              <Link href="/news">News</Link>
            </li>
            <li>
              <details>
                <summary>More</summary>
                <ul>
                  <li><Link href="/about">About Us</Link></li>
                  <li><Link href="/career">Career</Link></li>
                  <li><Link href="/faq">FAQ</Link></li>
                </ul>
              </details>
            </li>
            <li>
              <Link href="/admin">Admin</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href="/vtubers">VTubers</Link>
          </li>
          <li>
            <Link href="/artists">Artists</Link>
          </li>
          <li>
            <Link href="/news">News</Link>
          </li>
          <Link href="/" className="btn btn-ghost text-xl font-bold text-primary">
          ⭐ StarMy
          </Link>
          <li>
            <details>
              <summary>More</summary>
              <ul className="p-2 bg-base-100 rounded-box shadow-lg">
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/career">Career</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
              </ul>
            </details>
          </li>
          <li>
            <Link href="/admin">Admin</Link>
          </li>
        </ul>
        <Link href="/admin" className="btn btn-primary btn-sm" aria-label="Sign in">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" role="img">
            <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z"/>
          </svg>
        </Link>
      </div>
      <div className="navbar-end hidden lg:flex"> </div>
    </div>
  );
}
