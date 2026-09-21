'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './button';
import { Input } from './input';
import { Icons } from './icons';
import { DotPattern } from './dot-pattern';
import {
  AtSignIcon,
  ChevronLeftIcon,
  LockIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  LogOutIcon,
  ServerIcon,
  UserIcon,
} from 'lucide-react';

export interface UserSession {
  id: string;
  email: string | null;
  username: string;
  role: 'admin' | 'user';
  avatar_url?: string | null;
  discord_id?: string | null;
}

interface AuthPageProps {
  onBackToHome?: () => void;
}

export function AuthPage({ onBackToHome }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);

  // Check current session from database on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});

    // Check query params for Discord auth redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'discord_success') {
      setSuccessMsg('Successfully signed in with Discord!');
      fetch('/api/auth/me')
        .then((res) => res.json())
        .then((data) => {
          if (data?.user) setCurrentUser(data.user);
        });
    } else if (params.get('auth_error')) {
      setError('Discord Authentication error: ' + params.get('auth_error'));
    }
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const bodyPayload = isSignUp ? { email, password, username } : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || 'Authentication failed. Please check your credentials.');
      }

      setCurrentUser(data.user);
      setSuccessMsg(
        isSignUp
          ? `Welcome to KineticHost, ${data.user.username}! Account created.`
          : `Signed in successfully as ${data.user.username}.`
      );
      setEmail('');
      setPassword('');
      setUsername('');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscordLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const checkRes = await fetch('/api/auth/discord');
      const contentType = checkRes.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const data = await checkRes.json();
        if (!data.configured && data.simulateUrl) {
          window.location.href = data.simulateUrl;
          return;
        }
      }
      window.location.href = '/api/auth/discord';
    } catch (err: any) {
      setError('Unable to initiate Discord sign-in: ' + err.message);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      setSuccessMsg('Logged out successfully.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-white/20 selection:text-white flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-hidden">
      {/* Ambient Dot Pattern Background */}
      <DotPattern
        width={32}
        height={32}
        cx={1}
        cy={1}
        cr={1}
        className="fill-white/10 [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_80%)]"
      />

      {/* Subtle Radial Atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[650px] bg-gradient-to-tr from-white/[0.03] to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Floating Glass Pill Navigation */}
      <div className="absolute top-6 left-6 z-30">
        <button
          onClick={() => {
            if (onBackToHome) {
              onBackToHome();
            } else {
              window.location.href = '/';
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/[0.06] backdrop-blur-xl text-zinc-300 hover:text-white hover:bg-white/12 hover:border-white/30 text-xs font-medium tracking-tight transition-all duration-200 cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
        >
          <ChevronLeftIcon className="size-3.5" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Master 2-Column Split Glass Container */}
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-white/10 bg-zinc-950/70 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Left Column: Ambient Floating Paths & KineticHost Identity */}
        <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-10 border-r border-white/10 bg-gradient-to-b from-zinc-900/40 via-zinc-950/60 to-black/80 overflow-hidden">
          {/* Subtle Top & Bottom Gradient Vignettes */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none z-10" />

          {/* Floating Paths Ambient Wireframe */}
          <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
            <FloatingPaths position={1} />
            <FloatingPaths position={-1} />
          </div>

          {/* Top Brand Identity */}
          <div className="relative z-20 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <ServerIcon className="size-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-white leading-tight">KineticHost</p>
              <p className="text-[11px] font-mono text-zinc-400">Free Minecraft Hosting</p>
            </div>
          </div>

          {/* Center Brand Statement */}
          <div className="relative z-20 my-auto py-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/10 text-white text-[11px] font-medium tracking-wide uppercase mb-4 shadow-[0_0_15px_rgba(255,255,255,0.06)]">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Instant 24/7 Provisioning
            </div>
            <h2 className="text-3xl font-medium tracking-tight text-white leading-snug">
              Host your <em className="font-serif italic font-normal text-zinc-300">Minecraft world</em> free forever.
            </h2>
            <p className="mt-3 text-zinc-400 text-sm leading-relaxed">
              Paper, Fabric & Forge support with full FTP access, DDoS mitigation, and instant server controls.
            </p>
          </div>

          {/* Bottom Testimonial Pill */}
          <div className="relative z-20 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-4">
            <p className="text-xs text-zinc-300 leading-relaxed italic">
              &ldquo;KineticHost let us spin up an SMP in 30 seconds with zero lag. Our community loves the 24/7 uptime.&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-2.5">
              <div className="size-6 rounded-full border border-white/20 bg-white/10 flex items-center justify-center font-mono text-[10px] font-bold text-white">
                AS
              </div>
              <span className="text-xs font-medium text-white">Alex_SMP</span>
              <span className="text-[11px] font-mono text-zinc-500">• Community Owner</span>
            </div>
          </div>
        </div>

        {/* Right Column: Sleek Authentication Form */}
        <div className="lg:col-span-7 flex flex-col justify-center p-8 sm:p-12 md:p-14 bg-black/40">
          <div className="w-full max-w-md mx-auto space-y-6">
            {/* Mobile Brand Header */}
            <div className="flex items-center gap-2.5 lg:hidden mb-2">
              <div className="flex size-9 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                <ServerIcon className="size-4.5 text-white" />
              </div>
              <div>
                <p className="text-base font-bold text-white leading-tight">KineticHost</p>
                <p className="text-[10px] font-mono text-zinc-400">Free Minecraft Hosting</p>
              </div>
            </div>

            {/* Authenticated State */}
            {currentUser ? (
              <div className="space-y-6 rounded-2xl border border-white/15 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8">
                <div className="flex items-center gap-4">
                  {currentUser.avatar_url ? (
                    <img
                      src={currentUser.avatar_url}
                      alt={currentUser.username}
                      className="size-14 rounded-full border border-white/20 object-cover shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    />
                  ) : (
                    <div className="flex size-14 items-center justify-center rounded-full border border-white/20 bg-white/10 font-bold text-white text-lg shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                      {currentUser.username.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-white tracking-tight">{currentUser.username}</h2>
                    <p className="text-xs text-zinc-400 mt-0.5">{currentUser.email || 'Discord Connected'}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/15 text-[10px] font-mono uppercase tracking-wider">
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/60 p-4 text-xs font-mono text-zinc-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Database ID:</span>
                    <span className="text-zinc-200">{currentUser.id.slice(0, 18)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Session:</span>
                    <span className="text-emerald-400">Active</span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  <button
                    className="w-full h-11 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 shadow-[0_0_24px_rgba(255,255,255,0.2)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      if (onBackToHome) onBackToHome();
                      else window.location.href = '/';
                    }}
                  >
                    Return to Dashboard
                  </button>
                  <button
                    className="w-full h-10 rounded-full border border-white/15 bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/10 text-xs font-medium tracking-tight transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOutIcon className="size-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              /* Unauthenticated: Discord & Email Auth Only */
              <>
                <div className="space-y-1.5">
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                    {isSignUp ? 'Create your account' : 'Sign in to KineticHost'}
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-400">
                    {isSignUp
                      ? 'Deploy and manage your free Minecraft servers in seconds.'
                      : 'Access your Minecraft server console, file manager, and backups.'}
                  </p>
                </div>

                {/* Notifications */}
                {error && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
                    <AlertCircleIcon className="size-4 shrink-0 text-red-400" />
                    <span>{error}</span>
                  </div>
                )}
                {successMsg && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
                    <CheckCircle2Icon className="size-4 shrink-0 text-emerald-400" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* 1. Discord Login (Only Discord & Email) */}
                <button
                  type="button"
                  onClick={handleDiscordLogin}
                  disabled={loading}
                  className="w-full h-11 rounded-full bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-medium shadow-[0_0_24px_rgba(88,101,242,0.35)] hover:shadow-[0_0_30px_rgba(88,101,242,0.5)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                >
                  <Icons.discord className="w-5 h-5 fill-white shrink-0" />
                  <span>Continue with Discord</span>
                </button>

                {/* Ambient Divider */}
                <div className="relative flex items-center justify-center my-4">
                  <div className="w-full border-t border-white/10" />
                  <span className="bg-zinc-950 px-3 text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
                    OR
                  </span>
                  <div className="w-full border-t border-white/10" />
                </div>

                {/* 2. Email Form */}
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {isSignUp && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-300">Minecraft Username</label>
                      <div className="relative">
                        <Input
                          placeholder="e.g. SteveCraft"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="h-11 ps-10 rounded-xl border-white/15 bg-zinc-900/60 text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-white/40"
                        />
                        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3.5 text-zinc-500">
                          <UserIcon className="size-4" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">Email Address</label>
                    <div className="relative">
                      <Input
                        placeholder="player@kinetichost.net"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 ps-10 rounded-xl border-white/15 bg-zinc-900/60 text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-white/40"
                      />
                      <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3.5 text-zinc-500">
                        <AtSignIcon className="size-4" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">Password</label>
                    <div className="relative">
                      <Input
                        placeholder="••••••••••••"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 ps-10 rounded-xl border-white/15 bg-zinc-900/60 text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-white/40"
                      />
                      <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3.5 text-zinc-500">
                        <LockIcon className="size-4" />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 shadow-[0_0_24px_rgba(255,255,255,0.2)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {loading ? 'Authenticating...' : isSignUp ? 'Create Free Account' : 'Sign In with Email'}
                  </button>
                </form>

                {/* Mode Switcher */}
                <div className="text-center text-xs text-zinc-400 pt-1">
                  {isSignUp ? (
                    <p>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(false);
                          setError(null);
                        }}
                        className="text-white hover:underline font-medium cursor-pointer"
                      >
                        Sign In
                      </button>
                    </p>
                  ) : (
                    <p>
                      Don&apos;t have an account yet?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(true);
                          setError(null);
                        }}
                        className="text-white hover:underline font-medium cursor-pointer"
                      >
                        Create Free Account
                      </button>
                    </p>
                  )}
                </div>

                <p className="text-[11px] text-zinc-600 text-center leading-relaxed">
                  By connecting, you agree to the KineticHost{' '}
                  <a href="#" className="underline hover:text-zinc-400">Terms of Service</a>{' '}
                  and{' '}
                  <a href="#" className="underline hover:text-zinc-400">Privacy Policy</a>.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.6 + i * 0.02,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="h-full w-full text-white"
        viewBox="0 0 696 316"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.12 + path.id * 0.015}
            initial={{ pathLength: 0.3, opacity: 0.7 }}
            animate={{
              pathLength: 1,
              opacity: [0.35, 0.75, 0.35],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export default AuthPage;
