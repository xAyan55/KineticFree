import { Card, CardContent } from "@/components/ui/card"
import { Shield, Users, Download, CheckCircle2 } from "lucide-react"
import { DotPattern } from "@/components/ui/dot-pattern"
import { cn } from "@/lib/utils"

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32 bg-black text-white relative overflow-hidden">
      {/* Dot Pattern Background */}
      <DotPattern
        width={32}
        height={32}
        cx={1}
        cy={1}
        cr={1}
        className={cn(
          "fill-white/10 [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_80%)]",
        )}
      />
      <div className="mx-auto max-w-5xl px-6 relative z-10">
        {/* Section Header */}
        <div className="mb-14 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 text-white text-xs font-medium tracking-wide uppercase mb-4 shadow-[0_0_15px_rgba(255,255,255,0.08)]">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            100% Free Minecraft Features
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight">
            Everything your Minecraft SMP needs. At zero cost.
          </h2>
          <p className="mt-4 text-zinc-400 text-[15px] sm:text-base leading-relaxed">
            No server queues. No forced renewal credits. No paywalled FTP. KineticHost delivers full server capabilities with 24/7 uptime and zero compromises.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="relative z-10 grid grid-cols-6 gap-4">
          {/* Card 1: 100% Mod & Plugin Freedom */}
          <Card className="relative col-span-full flex flex-col justify-between overflow-hidden lg:col-span-2 bg-gradient-to-b from-zinc-900/80 to-zinc-950/90 border-white/10 hover:border-white/20 transition-all duration-300 group shadow-lg">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Mod Compatibility</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/10 text-white border border-white/20">
                  Unlimited
                </span>
              </div>

              {/* Central 100% Visual */}
              <div className="my-8 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center size-32">
                  {/* Glowing circular progress ring */}
                  <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      className="stroke-zinc-800"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      className="stroke-white drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]"
                      strokeWidth="8"
                      strokeDasharray="264"
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-bold tracking-tight text-white">100%</span>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Unlocked</span>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                  {["Paper", "Purpur", "Fabric", "Forge", "Bedrock"].map((tag) => (
                    <span key={tag} className="text-[11px] px-2 py-0.5 rounded border border-white/10 bg-white/5 text-zinc-300 font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 text-center">
                <h3 className="text-lg font-semibold text-white group-hover:text-zinc-200 transition-colors">
                  Mod & Plugin Freedom
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Full root SFTP access and custom JAR support. Run your favorite modpacks or Spigot plugins without restrictions.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Always-On DDoS Shield */}
          <Card className="relative col-span-full flex flex-col justify-between overflow-hidden sm:col-span-3 lg:col-span-2 bg-gradient-to-b from-zinc-900/80 to-zinc-950/90 border-white/10 hover:border-white/20 transition-all duration-300 group shadow-lg">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Network Defense</span>
                <span className="flex items-center gap-1.5 text-[11px] font-mono text-white">
                  <span className="size-1.5 rounded-full bg-white animate-ping"></span>
                  Active
                </span>
              </div>

              {/* Radar Graphic */}
              <div className="my-6 flex items-center justify-center">
                <div className="relative size-32 rounded-full border border-white/10 flex items-center justify-center bg-black/40">
                  <div className="absolute size-24 rounded-full border border-white/15"></div>
                  <div className="absolute size-16 rounded-full border border-white/25"></div>
                  <div className="absolute size-8 rounded-full border border-white/40 bg-white/10 flex items-center justify-center">
                    <Shield className="size-4 text-white" />
                  </div>
                  {/* Radar Sweep Line */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 via-transparent to-transparent animate-spin [animation-duration:4s]"></div>
                  {/* Ping blips */}
                  <span className="absolute top-6 right-8 size-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
                  <span className="absolute bottom-8 left-7 size-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
                </div>
              </div>

              <div className="space-y-1.5 text-center">
                <h3 className="text-lg font-semibold text-white group-hover:text-zinc-200 transition-colors">
                  Always-On DDoS Shield
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Minecraft-tuned DDoS packet filtering with multi-layer mitigation designed specifically for game server traffic. Stops bot raids and crash exploits.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: 20 TPS & NVMe Speed */}
          <Card className="relative col-span-full flex flex-col justify-between overflow-hidden sm:col-span-3 lg:col-span-2 bg-gradient-to-b from-zinc-900/80 to-zinc-950/90 border-white/10 hover:border-white/20 transition-all duration-300 group shadow-lg">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Tick Performance</span>
                <span className="text-[11px] font-mono text-white bg-white/10 border border-white/20 px-2 py-0.5 rounded">
                  Optimized
                </span>
              </div>

              {/* Performance Visualization */}
              <div className="my-6 rounded-lg border border-white/10 bg-black/60 p-3.5 space-y-2">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-zinc-400 font-mono">Server Grade</span>
                  <span className="text-white font-mono font-bold">High Performance</span>
                </div>
                <div className="h-12 w-full flex items-end gap-1 px-1">
                  {[85, 90, 88, 92, 95, 94, 98, 92, 96, 95, 93, 97, 99, 95, 98, 96, 94, 97, 99, 98].map((val, i) => (
                    <div
                      key={i}
                      style={{ height: `${val}%` }}
                      className="flex-1 bg-gradient-to-t from-white/30 to-white rounded-t-[1px] transition-all hover:bg-white/90"
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono pt-1 border-t border-white/5">
                  <span>Modern CPU</span>
                  <span>NVMe Storage</span>
                </div>
              </div>

              <div className="space-y-1.5 text-center">
                <h3 className="text-lg font-semibold text-white group-hover:text-zinc-200 transition-colors">
                  Instant Chunk Generation
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  High-performance processors paired with NVMe storage ensure fluid Elytra flight, fast chunk generation, and lag-free redstone builds.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: 1-Click Modpack & Plugin Hub */}
          <Card className="relative col-span-full overflow-hidden lg:col-span-3 bg-gradient-to-b from-zinc-900/80 to-zinc-950/90 border-white/10 hover:border-white/20 transition-all duration-300 group shadow-lg">
            <CardContent className="p-5 sm:p-6 grid sm:grid-cols-[1fr_1.25fr] gap-4 sm:gap-5 items-center">
              <div className="space-y-4">
                <div className="size-10 rounded-lg border border-white/15 bg-white/5 flex items-center justify-center">
                  <Download className="size-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-zinc-200 transition-colors">
                    1-Click Mod & Plugin Hub
                  </h3>
                  <p className="text-zinc-400 text-xs mt-2 leading-relaxed">
                    Support for Paper, Purpur, Fabric, Forge, Vanilla, and Velocity server JARs. Compatible with Modrinth, CurseForge, and SpigotMC software.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                  <CheckCircle2 className="size-4 text-zinc-300" />
                  <span>Auto-dependency resolution</span>
                </div>
              </div>

              {/* Supported Software Ecosystem */}
              <div className="space-y-2 rounded-lg border border-white/10 bg-black/60 p-2.5 sm:p-3">
                <div className="text-[11px] font-mono text-zinc-400 pb-1.5 border-b border-white/5 flex justify-between">
                  <span>Supported Software</span>
                  <span className="text-zinc-300">Ecosystem</span>
                </div>
                {[
                  { name: "Paper / Purpur", ver: "1.8 – 1.21+", type: "Server JAR" },
                  { name: "Fabric / Forge", ver: "All Versions", type: "Modded" },
                  { name: "Velocity / BungeeCord", ver: "Latest", type: "Proxy" },
                  { name: "Vanilla / Snapshot", ver: "All Versions", type: "Official" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded bg-zinc-900/60 border border-white/5 text-xs">
                    <div className="min-w-0">
                      <div className="font-medium text-zinc-200 truncate">{item.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{item.ver}</div>
                    </div>
                    <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/20 font-mono whitespace-nowrap">
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Card 5: Multi-User SMP Console Access */}
          <Card className="relative col-span-full overflow-hidden lg:col-span-3 bg-gradient-to-b from-zinc-900/80 to-zinc-950/90 border-white/10 hover:border-white/20 transition-all duration-300 group shadow-lg">
            <CardContent className="p-5 sm:p-6 grid sm:grid-cols-[1fr_1.3fr] gap-4 sm:gap-5 items-center">
              <div className="space-y-4">
                <div className="size-10 rounded-lg border border-white/15 bg-white/5 flex items-center justify-center">
                  <Users className="size-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-zinc-200 transition-colors">
                    Multi-User SMP Console
                  </h3>
                  <p className="text-zinc-400 text-xs mt-2 leading-relaxed">
                    Invite your friends and server staff with granular permissions: live console, file editor, and restart controls without sharing passwords.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                  <CheckCircle2 className="size-4 text-zinc-300" />
                  <span>Sub-user permission roles</span>
                </div>
              </div>

              {/* Permission Roles Architecture */}
              <div className="space-y-2 rounded-lg border border-white/10 bg-black/60 p-2.5 sm:p-3">
                <div className="text-[11px] font-mono text-zinc-400 pb-1.5 border-b border-white/5 flex items-center justify-between">
                  <span>Permission Roles</span>
                  <span className="flex items-center gap-1.5 text-zinc-300 text-[10.5px]">
                    Granular Access
                  </span>
                </div>
                {[
                  { role: "Owner", icon: "👑", perm: "Full Access" },
                  { role: "Administrator", icon: "🛡️", perm: "Console & Files" },
                  { role: "Moderator", icon: "⚙️", perm: "Restart Only" },
                ].map((member, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2.5 p-2 rounded bg-zinc-900/70 border border-white/5 text-xs transition-colors hover:border-white/15"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg shrink-0">{member.icon}</span>
                      <div className="min-w-0">
                        <div className="font-mono text-xs text-zinc-200 font-medium truncate">{member.role}</div>
                      </div>
                    </div>
                    <span className="shrink-0 text-[10px] font-mono text-zinc-200 bg-white/10 px-2 py-0.5 rounded border border-white/20 whitespace-nowrap">
                      {member.perm}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
export default Features
