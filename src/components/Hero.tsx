import React, { useEffect, useState } from "react"

export function Hero() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 901) {
        setMenuOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("menu-open")
    } else {
      document.body.classList.remove("menu-open")
    }
  }, [menuOpen])

  return (
    <div className="relative w-full h-screen min-h-[700px] max-h-[1080px] flex flex-col justify-between overflow-hidden bg-black text-white selection:bg-white/20 selection:text-white">
      {/* Grain overlay */}
      <div className="grain pointer-events-none fixed inset-0 z-[100] opacity-[0.04]" aria-hidden="true" />

      {/* Hero Video Background */}
      <div className="hero-photo absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-100" aria-hidden="true">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/hero_poster.jpg"
          className="w-full h-full object-cover object-center block"
        >
          <source src="/hf_20260818_072341_50851634-bbc3-4c33-9acc-7647d4db44aa.mp4" type="video/mp4" />
          <source src="/hero_h264.mp4" type="video/mp4" />
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260818_072341_50851634-bbc3-4c33-9acc-7647d4db44aa.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 pointer-events-none" />
      </div>

      {/* Menu Backdrop for Mobile */}
      <div
        className={`menu-backdrop fixed inset-0 z-40 bg-black/50 backdrop-blur-2xl transition-opacity duration-300 md:hidden ${
          menuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Header */}
      <header className="header relative z-50 grid grid-cols-[1fr_auto_1fr] items-center px-6 md:px-10 lg:px-16 pt-6 pb-2.5">
        <a href="#top" className="logo inline-flex items-center gap-2.5 justify-self-start text-[15.5px] font-semibold tracking-[-0.03em] text-white" aria-label="KineticHost">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-[22px] h-[22px] block" aria-hidden="true">
            <g transform="rotate(-30 12 12)">
              <circle cx="7.3" cy="3.2" r="1.45" />
              <rect x="5.5" y="4.7" width="3.6" height="14.6" rx="1.8" />
              <rect x="14.9" y="4.7" width="3.6" height="14.6" rx="1.8" />
              <circle cx="16.7" cy="20.8" r="1.45" />
            </g>
          </svg>
          <span>Kinetic<span className="font-normal opacity-90">Host</span></span>
        </a>

        {/* Center Navigation */}
        <nav
          id="site-nav"
          aria-label="Primary"
          className={`${
            menuOpen
              ? "fixed inset-0 z-45 flex flex-col justify-start items-center gap-4 pt-28 px-6 bg-black/95 backdrop-blur-2xl md:hidden"
              : "hidden md:flex items-center gap-1 px-1.5 py-1 rounded-full border border-white/15 bg-white/[0.05] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_24px_rgba(0,0,0,0.5)] justify-self-center"
          }`}
        >
          <a
            href="#features"
            className={`${
              menuOpen
                ? "w-full max-w-xs text-center py-3 text-lg text-white border-b border-white/10"
                : "inline-flex items-center justify-center h-[32px] px-4 rounded-full text-[13px] font-medium tracking-tight text-zinc-300 hover:text-white hover:bg-white/10 transition-all duration-200"
            }`}
            onClick={() => setMenuOpen(false)}
          >
            Features
          </a>
          <a
            href="#reviews"
            className={`${
              menuOpen
                ? "w-full max-w-xs text-center py-3 text-lg text-white border-b border-white/10"
                : "inline-flex items-center justify-center h-[32px] px-4 rounded-full text-[13px] font-medium tracking-tight text-zinc-300 hover:text-white hover:bg-white/10 transition-all duration-200"
            }`}
            onClick={() => setMenuOpen(false)}
          >
            Reviews
          </a>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-2 justify-self-end">
          <a
            href="#features"
            className="inline-flex items-center justify-center h-[36px] px-4.5 rounded-full text-[13px] font-medium tracking-tight text-[#111] bg-white hover:bg-zinc-200 shadow-[0_2px_12px_rgba(255,255,255,0.2)] transition-all duration-200 cursor-pointer whitespace-nowrap"
          >
            Create Free Server
          </a>

          {/* Burger Button */}
          <button
            className="burger md:hidden w-[42px] h-[42px] rounded-[6px] border border-white/20 bg-black/60 z-[60] flex flex-col items-center justify-center gap-[5px] p-0 cursor-pointer transition hover:border-white/40"
            aria-controls="site-nav"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className={`w-4 h-[1.5px] bg-white rounded-full transition-transform duration-250 ${menuOpen ? "translate-y-[6.5px] rotate-45" : ""}`} />
            <span className={`w-4 h-[1.5px] bg-white rounded-full transition-opacity duration-200 ${menuOpen ? "opacity-0" : "opacity-100"}`} />
            <span className={`w-4 h-[1.5px] bg-white rounded-full transition-transform duration-250 ${menuOpen ? "-translate-y-[6.5px] -rotate-45" : ""}`} />
          </button>
        </div>
      </header>

      {/* Hero Body Content */}
      <main className="hero relative z-10 flex flex-col items-center justify-end text-center px-6 pt-12 pb-16 md:pb-24 flex-1">
        <div className="max-w-[860px] w-full flex flex-col items-center">
          {/* Badge */}
          <div className="badge inline-flex items-center gap-2 mb-5 px-3.5 py-2 rounded-[5px] bg-gradient-to-r from-[#7d7d7d] via-[#2a2a2a] to-[#0a0a0a] text-[#f2f2f2] text-[12.5px] font-normal tracking-[-0.01em]">
            <svg className="badge-star w-[18px] h-[20px] fill-white drop-shadow-[0_0_3px_rgba(255,255,255,0.45)]" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2.6C12.55 2.6 12.88 3.15 13.08 4.7c.62 4.7 1.52 5.6 6.22 6.22 1.55.2 2.1.53 2.1 1.08s-.55.88-2.1 1.08c-4.7.62-5.6 1.52-6.22 6.22-.2 1.55-.53 2.1-1.08 2.1s-.88-.55-1.08-2.1c-.62-4.7-1.52-5.6-6.22-6.22C3.15 12.88 2.6 12.55 2.6 12s.55-.88 2.1-1.08c4.7-.62 5.6-1.52 6.22-6.22C11.12 3.15 11.45 2.6 12 2.6Z" />
            </svg>
            <span>Free 24/7 Minecraft Server Hosting</span>
          </div>

          {/* H1 Headline */}
          <h1 className="hero-title text-[36px] sm:text-[44px] md:text-[50px] lg:text-[56px] font-medium tracking-[-0.045em] leading-[1.12] text-white flex flex-col items-center">
            <span className="block overflow-hidden py-0.5">
              Host your <em className="font-serif italic font-normal text-[#9a9a9a] not-italic text-[1.08em] tracking-[-0.03em]">Minecraft world</em>
            </span>
            <span className="block overflow-hidden py-0.5">
              free forever, in seconds.
            </span>
          </h1>

          {/* Lede Subtitle */}
          <p className="lede max-w-[490px] mt-4.5 text-[#9a9a9a] text-[15.5px] font-normal leading-[1.55] tracking-[-0.015em]">
            High-performance free Minecraft hosting with full FTP access, Paper, Forge & Fabric support, instant setup, and 24/7 DDoS protection.
          </p>

          {/* Action Buttons */}
          <div className="hero-actions flex flex-wrap justify-center items-center gap-3 mt-7 w-full sm:w-auto">
            <a
              href="#features"
              className="inline-flex items-center justify-center h-[44px] px-6 rounded-full text-[14px] font-semibold tracking-tight text-black bg-white hover:bg-zinc-200 shadow-[0_0_24px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer w-full sm:w-auto whitespace-nowrap"
            >
              Create Free Server
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center h-[44px] px-6 rounded-full text-[14px] font-medium tracking-tight text-white border border-white/20 bg-white/[0.06] backdrop-blur-xl hover:bg-white/12 hover:border-white/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer w-full sm:w-auto whitespace-nowrap"
            >
              Explore Features
            </a>
          </div>
        </div>
      </main>

      {/* Stats Footer */}
      <footer className="stats relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 px-6 md:px-16 lg:px-20 pb-8 text-[#d8d8d8]">
        <div className="stat inline-flex items-center gap-3.5 text-[13.5px] tracking-[-0.015em] whitespace-nowrap">
          <svg className="stat-icon w-5 h-5 shrink-0 block" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="stat-pill-left-r" x1="3" y1="2" x2="14" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#3a3a3a" stopOpacity="0.62" />
              </linearGradient>
              <linearGradient id="stat-pill-right-r" x1="3" y1="2" x2="14" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3a3a3a" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.62" />
              </linearGradient>
            </defs>
            <rect x="3.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#stat-pill-left-r)" />
            <rect x="13.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#stat-pill-right-r)" />
            <rect x="9.2" y="10.9" width="5.6" height="2.2" rx="1.1" fill="#4a4a4a" />
          </svg>
          <span>500K+ Minecraft servers hosted</span>
        </div>

        <div className="stat inline-flex items-center gap-3.5 text-[13.5px] tracking-[-0.015em] whitespace-nowrap">
          <svg className="stat-icon w-5 h-5 shrink-0 block" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="2.4" y="2.4" width="19.2" height="19.2" rx="6.2" fill="#ffffff" />
            <path d="M12 7.1v7.4" stroke="#111111" strokeWidth="1.85" strokeLinecap="round" />
            <path d="M8.15 12.35L12 16.2l3.85-3.85" stroke="#111111" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>99.9% Uptime with DDoS Shield</span>
        </div>

        <div className="stat inline-flex items-center gap-3.5 text-[13.5px] tracking-[-0.015em] whitespace-nowrap">
          <svg className="stat-icon-wide w-[38px] h-[21px] shrink-0 block" viewBox="0 0 40 22" fill="none" aria-hidden="true">
            <circle cx="10.2" cy="11" r="9.2" fill="#2b2b2b" />
            <polygon points="7.2,5.2 8.6,8.2 6.6,8.0" fill="#2b2b2b" />
            <polygon points="13.2,5.2 11.8,8.2 13.8,8.0" fill="#2b2b2b" />
            <ellipse cx="10.2" cy="12.1" rx="4.15" ry="3.7" fill="#f4f4f4" />
            <circle cx="8.9" cy="11.8" r="0.7" fill="#1a1a1a" />
            <circle cx="11.5" cy="11.8" r="0.7" fill="#1a1a1a" />

            <circle cx="20.2" cy="11" r="9.2" fill="#ffffff" />
            <circle cx="17.4" cy="9.8" r="1.7" fill="#111111" />
            <circle cx="23.0" cy="9.8" r="1.7" fill="#111111" />
            <ellipse cx="20.2" cy="11.6" rx="1.1" ry="0.75" fill="#111111" />
            <path d="M18.2 13.6c1.1 1.1 2.9 1.1 4 0" stroke="#111111" strokeWidth="1.2" strokeLinecap="round" fill="none" />

            <circle cx="30.2" cy="11" r="9.2" fill="#f26b1d" />
            <text x="30.2" y="15.1" fontFamily="'Inter', sans-serif" fontWeight="700" fontSize="12.5" textAnchor="middle" fill="#ffffff">e</text>
          </svg>
          <span>2.4M+ players connected worldwide</span>
        </div>
      </footer>
    </div>
  )
}
