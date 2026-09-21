'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './button';
import { Input } from './input';
import { Icons } from './icons';
import { cn } from '@/lib/utils';
import {
  AtSignIcon,
  ChevronLeftIcon,
  LockIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  ShieldCheckIcon,
  LogOutIcon,
  ServerIcon,
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
      // refresh user
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
        throw new Error(data.message || 'Authentication failed. Please try again.');
      }

      setCurrentUser(data.user);
      setSuccessMsg(
        isSignUp
          ? `Welcome to KineticHost, ${data.user.username}! Account created in database.`
          : `Signed in successfully as ${data.user.username} (${data.user.role === 'admin' ? 'Administrator' : 'User'}).`
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

      // If JSON returned, it contains instructions or simulation link
      if (contentType.includes('application/json')) {
        const data = await checkRes.json();
        if (!data.configured && data.simulateUrl) {
          // Trigger dev simulation with real SQLite persistence
          window.location.href = data.simulateUrl;
          return;
        }
      }
      // Otherwise regular redirect
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
    <main className="relative min-h-screen bg-black text-white md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2 selection:bg-white selection:text-black">
      {/* Left Column: Ambient Floating Paths & KineticHost Showcase */}
      <div className="bg-zinc-950/80 relative hidden h-full flex-col border-r border-white/10 p-10 lg:flex overflow-hidden">
        <div className="from-black absolute inset-0 z-10 bg-gradient-to-t via-transparent to-transparent pointer-events-none" />

        {/* Brand Header */}
        <div className="z-10 flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg border border-white/20 bg-white/5 shadow-inner">
            <ServerIcon className="size-5 text-white" />
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight text-white">KineticHost</p>
            <p className="text-[11px] font-mono text-zinc-400">Free Minecraft Hosting</p>
          </div>
        </div>

        {/* Testimonial Quote */}
        <div className="z-10 mt-auto max-w-md">
          <blockquote className="space-y-3 rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-md">
            <div className="flex items-center gap-1 text-white/80">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-sm">★</span>
              ))}
            </div>
            <p className="text-lg font-light leading-relaxed text-zinc-200">
              &ldquo;KineticHost let us spin up an SMP in 30 seconds with full FTP access and zero lag. Our community loves the 24/7 uptime.&rdquo;
            </p>
            <footer className="flex items-center gap-3 pt-2">
              <div className="size-8 rounded-full border border-white/20 bg-white/10 flex items-center justify-center font-mono text-xs font-bold text-white">
                AS
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Alex_SMP</p>
                <p className="text-xs font-mono text-zinc-400">Minecraft Community Owner</p>
              </div>
            </footer>
          </blockquote>
        </div>

        {/* Animated Floating Paths Background */}
        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>

      {/* Right Column: Authentication Form */}
      <div className="relative flex min-h-screen flex-col justify-center p-6 sm:p-10 bg-black">
        {/* Ambient Subtle Radial Glow */}
        <div aria-hidden className="absolute inset-0 isolate pointer-events-none -z-10 opacity-40">
          <div className="bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06)_0%,transparent_70%)] absolute top-0 right-0 h-96 w-96 rounded-full" />
        </div>

        {/* Back to Home Button */}
        <Button
          variant="ghost"
          className="absolute top-6 left-6 text-zinc-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 rounded-full text-xs"
          onClick={() => {
            if (onBackToHome) {
              onBackToHome();
            } else {
              window.location.href = '/';
            }
          }}
        >
          <ChevronLeftIcon className="size-4 me-1.5" />
          Back to Home
        </Button>

        <div className="mx-auto w-full max-w-sm space-y-6">
          {/* Mobile Brand Header */}
          <div className="flex items-center gap-2 lg:hidden">
            <ServerIcon className="size-6 text-white" />
            <p className="text-xl font-bold text-white">KineticHost</p>
          </div>

          {/* User Already Logged In State */}
          {currentUser ? (
            <div className="space-y-6 rounded-2xl border border-white/15 bg-zinc-900/60 p-6 backdrop-blur-md">
              <div className="flex items-center gap-4">
                {currentUser.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.username}
                    className="size-14 rounded-full border border-white/20 object-cover"
                  />
                ) : (
                  <div className="flex size-14 items-center justify-center rounded-full border border-white/20 bg-white/10 font-bold text-white text-lg">
                    {currentUser.username.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{currentUser.username}</h2>
                    {currentUser.role === 'admin' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-mono text-white border border-white/20">
                        <ShieldCheckIcon className="size-3" />
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">{currentUser.email || 'Discord Connected'}</p>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-zinc-300 space-y-1 font-mono">
                <p>Database ID: <span className="text-zinc-500">{currentUser.id}</span></p>
                <p>Status: <span className="text-emerald-400">Authenticated (SQLite)</span></p>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  className="w-full bg-white text-black hover:bg-zinc-200 font-medium"
                  onClick={() => {
                    if (onBackToHome) onBackToHome();
                    else window.location.href = '/';
                  }}
                >
                  Return to Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/15 text-zinc-300 hover:text-white hover:bg-white/10"
                  onClick={handleLogout}
                >
                  <LogOutIcon className="size-4 me-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            /* Auth Form (Discord + Email Only) */
            <>
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {isSignUp ? 'Create your account' : 'Sign In to KineticHost'}
                </h1>
                <p className="text-sm text-zinc-400">
                  {isSignUp
                    ? 'Start hosting high-performance Minecraft servers for free.'
                    : 'Access your Minecraft servers, console, and files.'}
                </p>
              </div>

              {/* Status Notifications */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                  <AlertCircleIcon className="size-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}
              {successMsg && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                  <CheckCircle2Icon className="size-4 shrink-0 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* 1. Discord Login Button (ONLY Discord & Email) */}
              <div className="space-y-2">
                <Button
                  type="button"
                  size="lg"
                  className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium shadow-[0_0_20px_rgba(88,101,242,0.25)] hover:shadow-[0_0_25px_rgba(88,101,242,0.4)] transition-all flex items-center justify-center border-none"
                  onClick={handleDiscordLogin}
                  disabled={loading}
                >
                  <Icons.discord className="size-5 me-2 fill-white" />
                  Continue with Discord
                </Button>
              </div>

              <AuthSeparator />

              {/* 2. Email Login / Sign Up Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3.5">
                {isSignUp && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400">Minecraft / Display Name</label>
                    <Input
                      placeholder="e.g. Steve_Miner"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="border-white/15 bg-zinc-900/80 text-white placeholder:text-zinc-600 focus-visible:ring-white/30"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400">Email Address</label>
                  <div className="relative">
                    <Input
                      placeholder="your.email@example.com"
                      className="ps-9 border-white/15 bg-zinc-900/80 text-white placeholder:text-zinc-600 focus-visible:ring-white/30"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-zinc-500">
                      <AtSignIcon className="size-4" aria-hidden="true" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400">Password</label>
                  <div className="relative">
                    <Input
                      placeholder="••••••••••••"
                      className="ps-9 border-white/15 bg-zinc-900/80 text-white placeholder:text-zinc-600 focus-visible:ring-white/30"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-zinc-500">
                      <LockIcon className="size-4" aria-hidden="true" />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black hover:bg-zinc-200 font-medium transition-colors"
                >
                  {loading ? 'Processing...' : isSignUp ? 'Create Free Account' : 'Sign In with Email'}
                </Button>
              </form>

              {/* Toggle between Sign In and Sign Up */}
              <div className="text-center text-xs text-zinc-400">
                {isSignUp ? (
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(false);
                        setError(null);
                      }}
                      className="text-white hover:underline font-medium"
                    >
                      Sign In
                    </button>
                  </p>
                ) : (
                  <p>
                    Need an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(true);
                        setError(null);
                      }}
                      className="text-white hover:underline font-medium"
                    >
                      Create Free Account
                    </button>
                  </p>
                )}
              </div>

              {/* Admin credentials hint */}
              <div className="rounded-lg border border-white/10 bg-zinc-950 p-3 text-[11px] text-zinc-500 font-mono space-y-0.5">
                <p className="text-zinc-400 font-semibold flex items-center gap-1.5">
                  <ShieldCheckIcon className="size-3.5 text-zinc-300" />
                  Admin Account (.env credentials):
                </p>
                <p>Email: <code className="text-zinc-300">admin@kinetichost.net</code></p>
                <p>Password: <code className="text-zinc-300">KineticAdmin2026!</code></p>
              </div>

              <p className="text-zinc-500 text-[11px] text-center">
                By continuing, you agree to our{' '}
                <a href="#" className="underline hover:text-zinc-300">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="underline hover:text-zinc-300">Privacy Policy</a>.
              </p>
            </>
          )}
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
    color: `rgba(255,255,255,${0.04 + i * 0.015})`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        className="h-full w-full text-white"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.06 + path.id * 0.015}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
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

const AuthSeparator = () => {
  return (
    <div className="flex w-full items-center justify-center my-2">
      <div className="bg-white/10 h-px w-full" />
      <span className="text-zinc-500 px-3 text-[11px] font-mono uppercase">OR</span>
      <div className="bg-white/10 h-px w-full" />
    </div>
  );
};

export default AuthPage;
