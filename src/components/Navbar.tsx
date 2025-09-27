import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="block rounded-full overflow-hidden"
          title="Finsync home"
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
      <ul className="flex gap-8 text-[13px] items-center font-medium">
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
    </nav>
  );
}
