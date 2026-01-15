'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  FlashIcon,
  GridViewIcon,
  AddCircleIcon,
  Setting06Icon,
  Logout01Icon,
} from '@hugeicons/core-free-icons';
import { authClient } from '@/lib/auth-client';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (path: string) => pathname === path;
  const { data: session } = authClient.useSession();

  const currentCount = session?.user?.generationsCount ?? 0;
  const generationLimit = 2;
  const isLimitReached = currentCount >= generationLimit;

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/');
  };

  const userInitials = session?.user?.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'G';

  return (
    <aside className="w-64 h-screen bg-background border-r border-border fixed left-0 top-0 flex flex-col z-50">
      {/* Logo Area */}
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(170,255,0,0.5)] transition-shadow">
            <HugeiconsIcon icon={FlashIcon} size={20} color="black" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            Clash<span className="text-primary">Roast</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
            isActive('/dashboard')
              ? 'bg-zinc-800 text-white border border-zinc-700'
              : 'text-muted-foreground hover:text-white hover:bg-zinc-900'
          }`}
        >
          <HugeiconsIcon icon={GridViewIcon} size={20} />
          Dashboard
        </Link>

        <Link
          href="/upload"
          onClick={(e) => {
            if (isLimitReached) {
              e.preventDefault();
            }
          }}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
            isLimitReached
              ? 'opacity-50 cursor-not-allowed text-muted-foreground'
              : isActive('/upload')
              ? 'bg-zinc-800 text-white border border-zinc-700'
              : 'text-muted-foreground hover:text-white hover:bg-zinc-900'
          }`}
        >
          <HugeiconsIcon icon={AddCircleIcon} size={20} />
          New Project
        </Link>
      </nav>

      {/* User / Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <div className="flex items-center gap-3 w-full p-2">
          <div className="w-9 h-9 border border-zinc-700 overflow-hidden">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-medium">
                {userInitials}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {session?.user?.name || 'Guest User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {session?.user?.email || 'Free Plan'}
            </p>
          </div>
        </div>

        {session && (
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm"
          >
            <HugeiconsIcon icon={Logout01Icon} size={18} />
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}
