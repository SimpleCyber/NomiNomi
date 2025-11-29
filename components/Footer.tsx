import Link from "next/link";
import { Twitter, Disc, Linkedin, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[var(--background)] border-t border-[var(--border-color)] pt-6 pb-1 px-16">
      <div className="max-w-[1400px] mx-auto mb-5">
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-10">
          <div className="md:w-1/4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center">
                <img src="/image.png" alt="" />
              </div>
              <span className="text-xl font-bold text-[var(--foreground)] tracking-tight">
                NomiNomi
              </span>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-[var(--foreground)] font-semibold mb-4">
                Company
              </h3>
              <ul className="space-y-3 text-sm text-[var(--muted)]">
                <li>
                  <Link
                    href="#"
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[var(--foreground)] font-semibold mb-4">
                Help & Support
              </h3>
              <ul className="space-y-3 text-sm text-[var(--muted)]">
                <li>
                  <Link
                    href="#"
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    Learn
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    Guide
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    Support
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[var(--foreground)] font-semibold mb-4">
                Learn
              </h3>
              <ul className="space-y-3 text-sm text-[var(--muted)]">
                <li>
                  <Link
                    href="#"
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    Cardano Wallet
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    Sui Wallet
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    Monad Wallet
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[var(--foreground)] font-semibold mb-4">
                Token Price
              </h3>
              <ul className="space-y-3 text-sm text-[var(--muted)]">
                <li>
                  <Link
                    href="#"
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    Cardano Price
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    Bitcoin Price
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    Ethereum Price
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    Sui Price
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    Monad Price
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex gap-6 text-[var(--muted)] self-start">
            <Link
              href="#"
              className="hover:text-[var(--foreground)] transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </Link>
            <Link
              href="#"
              className="hover:text-[var(--foreground)] transition-colors"
            >
              <Disc className="w-5 h-5" />
            </Link>
            <Link
              href="#"
              className="hover:text-[var(--foreground)] transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </Link>
            <Link
              href="#"
              className="hover:text-[var(--foreground)] transition-colors"
            >
              <Github className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 text-xs text-[var(--muted)] ">
          <span>NomiNomi Exchange © 2025</span>
          <Link
            href="#"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            Legal
          </Link>
          <Link
            href="#"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
