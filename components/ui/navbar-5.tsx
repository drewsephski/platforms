"use client";

import { MenuIcon, Plus, LayoutGrid, User, CreditCard, Settings, Sparkles, Globe, Zap, Shield, BarChart3, Crown } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PlatformsLogo } from "@/components/platforms-logo";
import { CreditDisplay } from "@/components/credit-display";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface Navbar5Props {
  user: { email?: string; isAdmin?: boolean } | null;
}

export const Navbar5 = ({ user }: Navbar5Props) => {
  const pathname = usePathname();

  const createFeatures = [
    {
      title: "New Site",
      description: "Generate a site with AI",
      href: "/dashboard/new",
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      title: "From Template",
      description: "Start from a curated template",
      href: "/dashboard/new",
      icon: <LayoutGrid className="w-4 h-4" />,
    },
    {
      title: "From Prompt",
      description: "Describe what you want",
      href: "/dashboard/new",
      icon: <Zap className="w-4 h-4" />,
    },
  ];

  const manageFeatures = [
    {
      title: "All Sites",
      description: "View and manage your sites",
      href: "/dashboard",
      icon: <Globe className="w-4 h-4" />,
    },
  ];

  const accountFeatures = [
    {
      title: "Billing",
      description: "Subscription and payment",
      href: "/dashboard/billing",
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      title: "Pricing",
      description: "Plans and pricing",
      href: "/pricing",
      icon: <Crown className="w-4 h-4" />,
    },
    {
      title: "Settings",
      description: "Profile and preferences",
      href: "/dashboard",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const adminFeatures = [
    {
      title: "Dashboard",
      description: "System overview",
      href: "/admin",
      icon: <BarChart3 className="w-4 h-4" />,
    },
  ];

  return (
    <section className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="py-4">
        <div className="container px-4">
          <nav className="flex items-center justify-between">
          <Link
            href={user ? "/dashboard" : "/"}
            className="flex items-center gap-2 group lg:ml-16 md:ml-6"
          >
            <PlatformsLogo className="w-7 h-7 text-foreground group-hover:scale-105 transition-transform duration-200" />
            <span className="text-lg font-semibold tracking-tight">Platforms</span>
          </Link>
          <NavigationMenu className="hidden lg:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Create</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[340px] grid-cols-1 p-3">
                    {createFeatures.map((feature, index) => (
                      <NavigationMenuLink
                        href={feature.href}
                        key={index}
                        className="rounded-md p-3 transition-colors hover:bg-muted/70 flex items-start gap-3"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary flex-shrink-0">
                          {feature.icon}
                        </div>
                        <div>
                          <p className="mb-1 font-semibold text-foreground">
                            {feature.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Manage</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[340px] grid-cols-1 p-3">
                    {manageFeatures.map((feature, index) => (
                      <NavigationMenuLink
                        href={feature.href}
                        key={index}
                        className="rounded-md p-3 transition-colors hover:bg-muted/70 flex items-start gap-3"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary flex-shrink-0">
                          {feature.icon}
                        </div>
                        <div>
                          <p className="mb-1 font-semibold text-foreground">
                            {feature.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              {user && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Account</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[340px] grid-cols-1 p-3">
                      {accountFeatures.map((feature, index) => (
                        <NavigationMenuLink
                          href={feature.href}
                          key={index}
                          className="rounded-md p-3 transition-colors hover:bg-muted/70 flex items-start gap-3"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary flex-shrink-0">
                            {feature.icon}
                          </div>
                          <div>
                            <p className="mb-1 font-semibold text-foreground">
                              {feature.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {feature.description}
                            </p>
                          </div>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}
              {user?.isAdmin && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <Shield className="w-4 h-4 mr-1" />
                    Admin
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] grid-cols-1 p-3">
                      {adminFeatures.map((feature, index) => (
                        <NavigationMenuLink
                          href={feature.href}
                          key={index}
                          className="rounded-md p-3 transition-colors hover:bg-muted/70 flex items-start gap-3"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary flex-shrink-0">
                            {feature.icon}
                          </div>
                          <div>
                            <p className="mb-1 font-semibold text-foreground">
                              {feature.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {feature.description}
                            </p>
                          </div>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
          <div className="hidden items-center gap-4 lg:flex">
            <ThemeToggle />
            {user && pathname.startsWith("/dashboard") && (
              <CreditDisplay compact showPurchase={false} />
            )}
            {user && !user.isAdmin && (
              <Link
                href="/dashboard/billing"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400 rounded-full border border-amber-500/30 hover:border-amber-500/50 transition-colors"
              >
                <Crown className="w-3 h-3" />
                Upgrade
              </Link>
            )}
            {user ? (
              <Link href="/auth/signout">
                <Button variant="outline">Sign Out</Button>
              </Link>
            ) : (
              <Link href="/auth/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
            )}
            {!user && (
              <Link href="/auth/signin">
                <Button>Get Started</Button>
              </Link>
            )}
          </div>
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon">
                <MenuIcon className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="max-h-screen overflow-auto">
              <SheetHeader>
                <SheetTitle>
                  <Link
                    href={user ? "/dashboard" : "/"}
                    className="flex items-center gap-2"
                  >
                    <PlatformsLogo className="w-7 h-7 text-foreground" />
                    <span className="text-lg font-semibold tracking-tight">Platforms</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col p-4">
                <Accordion type="single" collapsible className="mt-4 mb-2">
                  <AccordionItem value="create" className="border-none">
                    <AccordionTrigger className="text-base hover:no-underline">
                      Create
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1">
                        {createFeatures.map((feature, index) => (
                          <Link
                            href={feature.href}
                            key={index}
                            className="rounded-md p-3 transition-colors hover:bg-muted/70 flex items-start gap-3"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary flex-shrink-0">
                              {feature.icon}
                            </div>
                            <div>
                              <p className="mb-1 font-semibold text-foreground">
                                {feature.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {feature.description}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="manage" className="border-none">
                    <AccordionTrigger className="text-base hover:no-underline">
                      Manage
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1">
                        {manageFeatures.map((feature, index) => (
                          <Link
                            href={feature.href}
                            key={index}
                            className="rounded-md p-3 transition-colors hover:bg-muted/70 flex items-start gap-3"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary flex-shrink-0">
                              {feature.icon}
                            </div>
                            <div>
                              <p className="mb-1 font-semibold text-foreground">
                                {feature.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {feature.description}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  {user && (
                    <AccordionItem value="account" className="border-none">
                      <AccordionTrigger className="text-base hover:no-underline">
                        Account
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-1">
                          {accountFeatures.map((feature, index) => (
                            <Link
                              href={feature.href}
                              key={index}
                              className="rounded-md p-3 transition-colors hover:bg-muted/70 flex items-start gap-3"
                            >
                              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary flex-shrink-0">
                                {feature.icon}
                              </div>
                              <div>
                                <p className="mb-1 font-semibold text-foreground">
                                  {feature.title}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {feature.description}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  {user?.isAdmin && (
                    <AccordionItem value="admin" className="border-none">
                      <AccordionTrigger className="text-base hover:no-underline">
                        <Shield className="w-4 h-4 mr-1" />
                        Admin
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-1">
                          {adminFeatures.map((feature, index) => (
                            <Link
                              href={feature.href}
                              key={index}
                              className="rounded-md p-3 transition-colors hover:bg-muted/70 flex items-start gap-3"
                            >
                              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary flex-shrink-0">
                                {feature.icon}
                              </div>
                              <div>
                                <p className="mb-1 font-semibold text-foreground">
                                  {feature.title}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {feature.description}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
                <div className="mt-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Theme</span>
                    <ThemeToggle />
                  </div>
                  {user && pathname.startsWith("/dashboard") && (
                    <CreditDisplay compact showPurchase={false} />
                  )}
                  {user ? (
                    <Link href="/auth/signout">
                      <Button variant="outline" className="w-full">Sign Out</Button>
                    </Link>
                  ) : (
                    <Link href="/auth/signin">
                      <Button variant="outline" className="w-full">Sign In</Button>
                    </Link>
                  )}
                  {!user && (
                    <Link href="/auth/signin">
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
        </div>
      </div>
    </section>
  );
};
