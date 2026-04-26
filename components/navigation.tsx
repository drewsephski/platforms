'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { CreditDisplay } from '@/components/credit-display';
import {
  LayoutGrid,
  Plus,
  CreditCard,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  Globe,
  Zap,
  Crown,
  ArrowUpRight,
  BarChart3,
  Shield,
} from 'lucide-react';
import { PlatformsLogo } from '@/components/platforms-logo';

// Navigation item types
interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
  badge?: string;
  external?: boolean;
}

interface NavGroup {
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
  featured?: NavItem;
}

// Navigation data structure
const navigationGroups: NavGroup[] = [
  {
    label: 'Create',
    icon: <Plus className="w-4 h-4" />,
    featured: {
      label: 'New Site',
      href: '/dashboard/new',
      icon: <Sparkles className="w-5 h-5" />,
      description: 'Generate a site with AI',
      badge: 'AI',
    },
    items: [
      { label: 'From Template', href: '/dashboard/new', icon: <LayoutGrid className="w-4 h-4" />, description: 'Start from a curated template' },
      { label: 'From Prompt', href: '/dashboard/new', icon: <Zap className="w-4 h-4" />, description: 'Describe what you want' },
    ],
  },
  {
    label: 'Manage',
    icon: <LayoutGrid className="w-4 h-4" />,
    items: [
      { label: 'All Sites', href: '/dashboard', icon: <Globe className="w-4 h-4" />, description: 'View and manage your sites' },
    ],
  },
  {
    label: 'Account',
    icon: <User className="w-4 h-4" />,
    items: [
      { label: 'Billing', href: '/dashboard/billing', icon: <CreditCard className="w-4 h-4" />, description: 'Plans and payments' },
      { label: 'Settings', href: '/dashboard', icon: <Settings className="w-4 h-4" />, description: 'Profile and preferences' },
    ],
  },
];

const adminNav: NavGroup = {
  label: 'Admin',
  icon: <Shield className="w-4 h-4" />,
  items: [
    { label: 'Dashboard', href: '/admin', icon: <BarChart3 className="w-4 h-4" />, description: 'System overview' },
  ],
};

// Dropdown menu component with enhanced animations
function DropdownMenu({
  group,
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: {
  group: NavGroup;
  isOpen: boolean;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute top-full left-0 mt-1 w-72 z-50"
        >
          <div className="overflow-hidden rounded-xl bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl shadow-black/10">
            {/* Featured item at top */}
            {group.featured && (
              <div className="p-3 border-b border-border/50">
                <Link
                  href={group.featured.href}
                  onClick={onClose}
                  className="group flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 transition-all duration-200"
                >
                  <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 text-primary">
                    {group.featured.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{group.featured.label}</span>
                      {group.featured.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-accent/20 text-accent rounded">
                          {group.featured.badge}
                        </span>
                      )}
                    </div>
                    {group.featured.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{group.featured.description}</p>
                    )}
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
            )}

            {/* Navigation items */}
            <div className="p-2">
              {group.items.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.15 }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/60 transition-colors"
                  >
                    <span className="flex-shrink-0 p-1.5 rounded-md bg-muted/50 text-muted-foreground group-hover:text-foreground group-hover:bg-muted transition-colors">
                      {item.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="block text-sm font-medium">{item.label}</span>
                      {item.description && (
                        <span className="block text-xs text-muted-foreground truncate">{item.description}</span>
                      )}
                    </div>
                    {item.external && (
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Main navigation trigger component
function NavTrigger({
  group,
  isActive,
  isOpen,
  onMouseEnter,
  onMouseLeave,
}: {
  group: NavGroup;
  isActive: boolean;
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <button
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'group flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
        isActive
          ? 'text-foreground bg-muted/60'
          : isOpen
            ? 'text-foreground hover:bg-muted/40'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
      )}
    >
      <span className={cn(
        'transition-colors duration-200',
        isActive || isOpen ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
      )}>
        {group.icon}
      </span>
      <span>{group.label}</span>
      <ChevronDown
        className={cn(
          'w-3.5 h-3.5 transition-transform duration-200',
          isOpen && 'rotate-180'
        )}
      />
    </button>
  );
}

// User menu component
function UserMenu({ user }: { user: { email?: string; isAdmin?: boolean } | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  if (!user) {
    return (
      <Link
        href="/auth/signin"
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
      >
        <User className="w-4 h-4" />
        Sign In
      </Link>
    );
  }

  return (
    <div ref={menuRef} className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
          isOpen
            ? 'bg-muted/60 text-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
        )}
      >
        <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center">
          <User className="w-4 h-4 text-accent" />
        </div>
        <span className="hidden sm:block max-w-[120px] truncate">{user.email?.split('@')[0]}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute top-full right-0 mt-1 w-56 z-50"
          >
            <div className="overflow-hidden rounded-xl bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl shadow-black/10">
              <div className="p-3 border-b border-border/50">
                <p className="text-sm font-medium truncate">{user.email}</p>
                {user.isAdmin && (
                  <span className="inline-flex items-center gap-1 mt-1 text-xs text-accent">
                    <Shield className="w-3 h-3" />
                    Admin
                  </span>
                )}
              </div>
              <div className="p-2">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted/60 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <Link
                  href="/dashboard/billing"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted/60 transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  Billing
                </Link>
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted/60 transition-colors text-accent"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}
              </div>
              <div className="p-2 border-t border-border/50">
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Main navigation component
export function Navigation({ user }: { user: { email?: string; isAdmin?: boolean } | null }) {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdowns when route changes
  useEffect(() => {
    setOpenDropdown(null);
  }, [pathname]);

  const allGroups = user?.isAdmin ? [...navigationGroups, adminNav] : navigationGroups;

  const handleMouseEnter = (label: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpenDropdown(label);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 flex-shrink-0 group">
            <PlatformsLogo className="w-7 h-7 text-foreground group-hover:scale-105 transition-transform duration-200" />
            <span className="font-semibold text-lg hidden sm:block">Platforms</span>
          </Link>

          {/* Navigation Groups */}
          <nav className="hidden md:flex items-center gap-1">
            {allGroups.map((group) => {
              const isActive = group.items.some(item => pathname === item.href || pathname.startsWith(item.href + '/'));
              const isOpen = openDropdown === group.label;

              return (
                <div key={group.label} className="relative">
                  <NavTrigger
                    group={group}
                    isActive={isActive}
                    isOpen={isOpen}
                    onMouseEnter={() => handleMouseEnter(group.label)}
                    onMouseLeave={handleMouseLeave}
                  />
                  <DropdownMenu
                    group={group}
                    isOpen={isOpen}
                    onClose={() => setOpenDropdown(null)}
                    onMouseEnter={() => handleMouseEnter(group.label)}
                    onMouseLeave={handleMouseLeave}
                  />
                </div>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Credits - show in dashboard */}
            {user && pathname.startsWith('/dashboard') && (
              <div className="hidden sm:block">
                <CreditDisplay compact showPurchase={false} />
              </div>
            )}

            {/* Upgrade button for non-pro users */}
            {user && !user.isAdmin && (
              <Link
                href="/dashboard/billing"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400 rounded-full border border-amber-500/30 hover:border-amber-500/50 transition-colors"
              >
                <Crown className="w-3 h-3" />
                Upgrade
              </Link>
            )}

            <div className="h-6 w-px bg-border/50 hidden sm:block" />

            <ThemeToggle />

            <UserMenu user={user} />
          </div>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="md:hidden border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            {allGroups.slice(0, 3).map((group) => {
              const firstItem = group.featured || group.items[0];
              const isActive = pathname === firstItem.href || pathname.startsWith(firstItem.href + '/');

              return (
                <Link
                  key={group.label}
                  href={firstItem.href}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs rounded-lg transition-colors',
                    isActive
                      ? 'text-foreground bg-muted/60'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  )}
                >
                  <span className={cn('transition-colors', isActive ? 'text-foreground' : 'text-muted-foreground')}>
                    {group.icon}
                  </span>
                  <span>{group.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}

// Simple breadcrumb navigation for nested pages
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <span className="text-border">/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

// Footer navigation for public pages
export function Footer() {
  const footerLinks = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '/#features' },
        { label: 'Templates', href: '/#templates' },
        { label: 'Pricing', href: '/#pricing' },
      ],
    },
    {
      title: 'Account',
      links: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Billing', href: '/dashboard/billing' },
        { label: 'Sign In', href: '/auth/signin' },
      ],
    },
  ];

  return (
    <footer className="border-t border-border/50 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <PlatformsLogo className="w-6 h-6 text-foreground" />
              <span className="font-semibold">Platforms</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Transform prompts into production-ready websites instantly.
            </p>
          </div>

          {/* Link groups */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="font-medium text-sm mb-3">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Platforms
          </p>
        </div>
      </div>
    </footer>
  );
}
