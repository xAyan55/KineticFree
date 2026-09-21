"use client";
import Link from "next/link";

import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

export interface FooterProps {
  brandName?: string;
  watermarkText?: string;
}

function Footer({
  brandName = "KineticHost",
  watermarkText = "KineticHost",
}: FooterProps) {
  return (
    <footer className="py-12 px-4 md:px-6 bg-black border-t border-white/10 text-white">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="mb-8 md:mb-0 max-w-sm">
            <Link href="#top" className="flex items-center gap-2 text-white hover:opacity-90 transition-opacity">
              <Icons.logo className="icon-class w-7 h-7 text-white" />
              <h2 className="text-lg font-bold tracking-tight">{brandName}</h2>
            </Link>

            <h1 className="text-zinc-400 mt-4 text-sm leading-relaxed">
              High-performance free Minecraft server hosting with full FTP access, 24/7 uptime, and automated DDoS protection.
            </h1>
            <div className="mt-3">
              <Link href="https://x.com" target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" className="rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs h-8 px-3">
                  Share Your Thoughts On
                  <Icons.twitter className="icon-class ml-1.5 w-3 h-3 fill-current" />
                </Button>
              </Link>
            </div>
            <p className="text-xs text-zinc-500 mt-5">
              © {new Date().getFullYear()} {brandName}. All rights reserved.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-sm text-white mb-4 tracking-tight">Navigation</h3>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link href="#top" className="text-zinc-400 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="text-zinc-400 hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#reviews" className="text-zinc-400 hover:text-white transition-colors">
                    Reviews
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="text-zinc-400 hover:text-white transition-colors">
                    Server Software
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-white mb-4 tracking-tight">Community</h3>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
                    Discord Server
                  </Link>
                </li>
                <li>
                  <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
                    X (Twitter)
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-white mb-4 tracking-tight">Legal</h3>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link href="/privacy" className="text-zinc-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-zinc-400 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/sla" className="text-zinc-400 hover:text-white transition-colors">
                    Service Level Agreement
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Large Brand Watermark */}
        <div className="w-full flex mt-8 md:mt-12 items-center justify-center overflow-hidden">
          <h1 className="text-center text-5xl sm:text-7xl md:text-8xl lg:text-[9.5rem] font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-zinc-700/60 via-zinc-800/40 to-black select-none pointer-events-none uppercase">
            {watermarkText}
          </h1>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
export default Footer;
