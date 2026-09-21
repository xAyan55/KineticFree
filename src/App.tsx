import { Hero } from "@/components/Hero"
import { Features } from "@/components/ui/features-8"
import { TestimonialMarqueeDemo } from "@/components/ui/marquee-01"
import { Footer } from "@/components/ui/large-name-footer"
import { DotPattern } from "@/components/ui/dot-pattern"

export function App() {
  return (
    <div className="min-h-screen bg-black text-white dark flex flex-col">
      {/* Top Hero landing page */}
      <Hero />

      {/* Features Section */}
      <div className="relative z-20 border-t border-white/10 bg-black">
        <Features />
      </div>

      {/* Reviews Section */}
      <section id="reviews" className="relative z-20 border-t border-white/10 bg-black py-20 md:py-32 overflow-hidden">
        {/* Dot Pattern Background */}
        <DotPattern
          width={32}
          height={32}
          cx={1}
          cy={1}
          cr={1}
          className="fill-white/10 [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_80%)]"
        />

        <div className="relative z-10 mx-auto max-w-5xl px-6 mb-14 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 text-white text-xs font-medium tracking-wide uppercase mb-4 shadow-[0_0_15px_rgba(255,255,255,0.08)]">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            Community Reviews
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight">
            Trusted by server owners worldwide
          </h2>
          <p className="mt-4 text-zinc-400 text-[15px] sm:text-base leading-relaxed max-w-2xl mx-auto">
            See what Minecraft SMP creators, modpack hosts, and network administrators say about hosting with KineticHost.
          </p>
        </div>

        <div className="relative z-10">
          <TestimonialMarqueeDemo />
        </div>
      </section>

      {/* Large Name Footer */}
      <Footer brandName="KineticHost" watermarkText="KineticHost" />
    </div>
  )
}

export default App
