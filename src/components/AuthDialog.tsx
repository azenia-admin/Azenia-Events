'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/supabase-auth';
import { Loader2 } from 'lucide-react';

type Mode = 'signin' | 'signup';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: Mode;
}

export function AuthDialog({ open, onOpenChange, initialMode = 'signin' }: Props) {
  const { signUp, signInWithPassword } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (mode === 'signup') {
        await signUp(email, password);
      } else {
        await signInWithPassword(email, password);
      }
      onOpenChange(false);
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setError(null);
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'signin'
              ? 'Sign in to manage your events and seating charts.'
              : 'Start building unforgettable events in minutes.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={switchMode}
              className="font-semibold text-primary hover:underline"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
