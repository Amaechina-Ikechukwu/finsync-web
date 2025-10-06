"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <nav className="w-full flex items-center justify-between gap-6 relative">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="block rounded-full overflow-hidden"
          title="Finsync home"
          onClick={closeMenu}
        >
          <Image
            src="/assets/logo.png"
            alt="Finsync logo"
            width={40}
            height={40}
            className="h-10 w-10 object-cover"
            priority={true}
          />
        </Link>
        <span className="font-serif text-lg font-semibold hidden sm:inline tracking-tight">
          Finsync
        </span>
      </div>

      {/* Desktop nav */}
      <ul className="hidden sm:flex gap-8 text-[13px] items-center font-medium">
        <li>
          <Link
            href="#"
            className="relative text-neutral-600 hover:text-black transition-colors"
          >
            <span className="after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 hover:after:w-full after:bg-black after:transition-all after:duration-300">
              Products
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/faq"
            className="relative text-neutral-600 hover:text-black transition-colors"
          >
            <span className="after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 hover:after:w-full after:bg-black after:transition-all after:duration-300">
              FAQ
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/terms"
            className="relative text-neutral-600 hover:text-black transition-colors"
          >
            <span className="after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 hover:after:w-full after:bg-black after:transition-all after:duration-300">
              Terms
            </span>
          </Link>
        </li>
      </ul>

      {/* Mobile hamburger */}
      <button
        type="button"
        aria-label="Toggle menu"
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="sm:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg border border-black/10 hover:bg-black/5 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          // X icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <title>Close menu</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          // Hamburger icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <title>Open menu</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {/* Mobile menu panel */}
      {open && (
        <div
          id="mobile-nav"
          className="sm:hidden absolute right-0 top-full mt-3 w-48 rounded-2xl border border-black/10 bg-white shadow-lg z-50 overflow-hidden"
        >
          <ul className="py-1 text-[14px] font-medium">
            <li>
              <Link
                href="#"
                className="block px-4 py-2 text-neutral-700 hover:bg-neutral-50"
                onClick={closeMenu}
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                href="/faq"
                className="block px-4 py-2 text-neutral-700 hover:bg-neutral-50"
                onClick={closeMenu}
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="block px-4 py-2 text-neutral-700 hover:bg-neutral-50"
                onClick={closeMenu}
              >
                Terms
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
