'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, ArrowLeft, Check } from 'lucide-react';
import { PlatformsLogo } from '@/components/platforms-logo';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { rootDomain } from '@/lib/utils';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        redirect('/dashboard');
      }
    } catch (err: any) {
      setError('An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        redirect('/dashboard');
      }
    } catch (err: any) {
      setError('An error occurred during sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background relative overflow-hidden flex flex-col">
      {/* Subtle grid pattern background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(oklch(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, oklch(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Gradient orbs for depth */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/30 rounded-full blur-3xl pointer-events-none" />
      
      {/* Navigation - fixed at top */}
      <nav className="relative z-10 w-full">
        <div className="max-w-md mx-auto px-6 py-5">
          <Link 
            href="/" 
            className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Back to home</span>
          </Link>
        </div>
      </nav>

      {/* Main content - properly centered */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <motion.div 
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5, 
            ease: [0.16, 1, 0.3, 1]
          }}
        >
          {/* Logo section */}
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.4, 
              delay: 0.1,
              ease: [0.16, 1, 0.3, 1]
            }}
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-foreground mb-5 shadow-lg shadow-foreground/5">
              <PlatformsLogo className="w-7 h-7 text-background" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1.5">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to {rootDomain}
            </p>
          </motion.div>

          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="bg-card rounded-2xl border border-border/60 shadow-sm shadow-black/[0.02] overflow-hidden"
          >
            <div className="p-7">
              <form className="space-y-5">
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25, duration: 0.3 }}
                >
                  <Label 
                    htmlFor="email" 
                    className="text-[13px] font-medium text-foreground/90"
                  >
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 bg-background border-border/60 focus:border-ring focus:ring-1 focus:ring-ring/20 transition-all duration-200"
                    required
                  />
                </motion.div>
                
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <Label 
                    htmlFor="password" 
                    className="text-[13px] font-medium text-foreground/90"
                  >
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 bg-background border-border/60 focus:border-ring focus:ring-1 focus:ring-ring/20 transition-all duration-200"
                    required
                  />
                </motion.div>

                {/* Error message */}
                {error && (
                  <motion.div 
                    className="flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/[0.06] border border-destructive/15"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-destructive leading-relaxed">{error}</p>
                  </motion.div>
                )}

                {/* Success message */}
                {successMessage && (
                  <motion.div 
                    className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/70"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-emerald-900 leading-relaxed">{successMessage}</p>
                  </motion.div>
                )}

                <div className="space-y-3 pt-1">
                  <Button
                    type="submit"
                    onClick={handleSignIn}
                    disabled={isLoading}
                    className="w-full h-11 font-medium transition-all duration-200 shadow-sm shadow-primary/10 hover:shadow-md hover:shadow-primary/15 hover:-translate-y-[1px] active:translate-y-0"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Sign In
                  </Button>
                  
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-card px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
                        Or
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSignUp}
                    disabled={isLoading}
                    className="w-full h-11 font-medium transition-all duration-200 hover:bg-secondary/60 border-border/60"
                  >
                    Create Account
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>

          <motion.p 
            className="text-center text-xs text-muted-foreground/50 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            By continuing, you agree to our Terms of Service
          </motion.p>
        </motion.div>
      </main>
    </div>
  );
}
