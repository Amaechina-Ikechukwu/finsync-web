import Link from "next/link";

function Icon({ name }: { name: string }) {
  switch (name) {
    case "facebook":
      return (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.12 8.44 9.88v-6.99H8.08V12h2.36V9.8c0-2.33 1.38-3.61 3.5-3.61 1.02 0 2.09.18 2.09.18v2.3h-1.18c-1.16 0-1.52.72-1.52 1.46V12h2.59l-.41 2.89h-2.18v6.99C18.34 21.12 22 16.99 22 12z" />
        </svg>
      );
    case "twitter":
      return (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M8.29 20c7.55 0 11.68-6.26 11.68-11.68 0-.18 0-.35-.01-.53A8.36 8.36 0 0 0 22 5.92a8.19 8.19 0 0 1-2.36.65 4.1 4.1 0 0 0 1.8-2.27 8.2 8.2 0 0 1-2.6.99A4.1 4.1 0 0 0 12.07 8a11.64 11.64 0 0 1-8.45-4.29 4.1 4.1 0 0 0 1.27 5.47A4.07 4.07 0 0 1 2.8 8.7v.05a4.1 4.1 0 0 0 3.29 4.02 4.1 4.1 0 0 1-1.85.07 4.1 4.1 0 0 0 3.83 2.85A8.23 8.23 0 0 1 2 18.58 11.6 11.6 0 0 0 8.29 20" />
        </svg>
      );
    case "instagram":
      return (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 6.5A4.5 4.5 0 1 0 16.5 13 4.5 4.5 0 0 0 12 8.5zM18.5 6a1 1 0 1 1-1 1 1 1 0 0 1 1-1z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.1 1 2.5 1 4.98 2.12 4.98 3.5zM0 8h5v14H0zM7 8h4.8v2h.1c.7-1.3 2.4-2.7 4.9-2.7C22 7.3 24 9.8 24 14.2V22h-5v-7.4c0-1.7-.1-3.9-2.4-3.9-2.4 0-2.8 1.9-2.8 3.8V22H7z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-neutral-100 pt-10 text-neutral-700">
      <div className="mx-auto max-w-7xl px-5 sm:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:underline">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/agents" className="hover:underline">
                  Become an Agent
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/services/vtu" className="hover:underline">
                  VTU & Bills
                </Link>
              </li>
              <li>
                <Link href="/services/crypto" className="hover:underline">
                  Crypto
                </Link>
              </li>
              <li>
                <Link href="/services/cards" className="hover:underline">
                  Virtual Cards
                </Link>
              </li>
              <li>
                <Link href="/services/pos" className="hover:underline">
                  POS
                </Link>
              </li>
              <li>
                <Link href="/services/giftcards" className="hover:underline">
                  Gift Cards
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="hover:underline">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:underline">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Follow us</h4>
            <div className="flex items-center gap-3">
              <Link
                href="https://facebook.com"
                className="text-neutral-500 hover:text-neutral-700"
                aria-label="Facebook"
              >
                <Icon name="facebook" />
              </Link>
              <Link
                href="https://twitter.com"
                className="text-neutral-500 hover:text-neutral-700"
                aria-label="Twitter"
              >
                <Icon name="twitter" />
              </Link>
              <Link
                href="https://instagram.com"
                className="text-neutral-500 hover:text-neutral-700"
                aria-label="Instagram"
              >
                <Icon name="instagram" />
              </Link>
              <Link
                href="https://linkedin.com"
                className="text-neutral-500 hover:text-neutral-700"
                aria-label="LinkedIn"
              >
                <Icon name="linkedin" />
              </Link>
            </div>
            <p className="mt-6 text-sm text-neutral-500">
              © 2025 Finsync Digital Services. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
