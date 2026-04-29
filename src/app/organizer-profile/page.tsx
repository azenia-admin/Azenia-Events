'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Plus,
  Star,
  Pencil,
  Trash2,
  Check,
  Loader2,
  ArrowRight,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUser } from '@/lib/supabase-auth';
import { useOrganization, type Organization } from '@/lib/organization';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type FormState = {
  name: string;
  website: string;
  description: string;
};

const EMPTY_FORM: FormState = { name: '', website: '', description: '' };

export default function OrganizerProfilePage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const { organizations, currentOrganization, setCurrentOrganization, isLoading, refresh } =
    useOrganization();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Organization | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Organization | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) router.replace('/');
  }, [user, isUserLoading, router]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (org: Organization) => {
    setEditing(org);
    setForm({
      name: org.name,
      website: org.website ?? '',
      description: org.description ?? '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.name.trim()) return;
    setIsSubmitting(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from('organizations')
          .update({
            name: form.name.trim(),
            website: form.website.trim() || null,
            description: form.description.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editing.id);
        if (error) throw error;
        toast({ title: 'Organization updated' });
      } else {
        const { data, error } = await supabase
          .from('organizations')
          .insert({
            owner_id: user.id,
            name: form.name.trim(),
            website: form.website.trim() || null,
            description: form.description.trim() || null,
            is_primary: organizations.length === 0,
          })
          .select()
          .maybeSingle();
        if (error) throw error;
        toast({ title: 'Organization created' });
        if (data && organizations.length === 0) {
          setCurrentOrganization(data as Organization);
        }
      }
      await refresh();
      setDialogOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast({ variant: 'destructive', title: 'Error', description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMakePrimary = async (org: Organization) => {
    if (!user || org.is_primary) return;
    try {
      const { error: clearError } = await supabase
        .from('organizations')
        .update({ is_primary: false })
        .eq('owner_id', user.id)
        .eq('is_primary', true);
      if (clearError) throw clearError;

      const { error } = await supabase
        .from('organizations')
        .update({ is_primary: true })
        .eq('id', org.id);
      if (error) throw error;

      toast({ title: `${org.name} is now your primary organization` });
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not set primary';
      toast({ variant: 'destructive', title: 'Error', description: message });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', deleteTarget.id);
      if (error) throw error;
      toast({ title: 'Organization deleted' });
      if (currentOrganization?.id === deleteTarget.id) {
        const remaining = organizations.filter((o) => o.id !== deleteTarget.id);
        const fallback = remaining.find((o) => o.is_primary) || remaining[0];
        if (fallback) setCurrentOrganization(fallback);
      }
      await refresh();
      setDeleteTarget(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not delete';
      toast({ variant: 'destructive', title: 'Error', description: message });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className="min-h-[60vh] bg-[#FAF6F1] p-8">
        <div className="container mx-auto">
          <Skeleton className="h-10 w-64 mb-6" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F1] text-[#1B1A17]">
      <section className="border-b border-[#E8DFD3]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-2xl">
              <p className="text-[#D97757] text-xs font-medium tracking-wider uppercase mb-3">
                Organizer profile
              </p>
              <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
                Your <span className="italic text-[#D97757]">organizations.</span>
              </h1>
              <p className="mt-4 text-[#55514B] text-lg leading-relaxed">
                Create and manage the organizations behind your events. Events you create belong to
                your active organization.
              </p>
            </div>
            <Button
              size="lg"
              onClick={openCreate}
              className="bg-[#1B1A17] text-[#FAF6F1] hover:bg-[#2D2B26] rounded-full px-7 h-12 group self-start"
            >
              <Plus className="mr-2 h-4 w-4" />
              New organization
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading ? (
          <div className="grid gap-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        ) : organizations.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#E8DFD3] bg-white/50 px-8 py-16 text-center">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-[#E8A355]/15 border border-[#E8A355]/20 flex items-center justify-center mb-5">
              <Building2 className="h-6 w-6 text-[#D97757]" />
            </div>
            <h3 className="font-headline text-2xl font-semibold">No organizations yet</h3>
            <p className="mt-2 text-[#55514B] max-w-md mx-auto">
              Create your first organization to start organizing events under a shared brand.
            </p>
            <Button
              onClick={openCreate}
              className="mt-6 bg-[#1B1A17] text-[#FAF6F1] hover:bg-[#2D2B26] rounded-full px-6 h-11"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create organization
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {organizations.map((org) => {
              const isActive = currentOrganization?.id === org.id;
              return (
                <div
                  key={org.id}
                  className={cn(
                    'rounded-2xl border bg-white p-6 transition-all',
                    isActive
                      ? 'border-[#D97757]/40 shadow-lg shadow-[#D97757]/5'
                      : 'border-[#E8DFD3] hover:border-[#D97757]/40'
                  )}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="h-14 w-14 rounded-2xl bg-[#F0E6D6] border border-[#E8DFD3] flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-6 w-6 text-[#D97757]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-headline text-xl font-semibold truncate">
                            {org.name}
                          </h3>
                          {org.is_primary && (
                            <span className="inline-flex items-center gap-1 rounded-full text-xs font-medium px-2.5 py-0.5 bg-[#E8A355]/15 text-[#B86D3D] border border-[#E8A355]/30">
                              <Star className="h-3 w-3" />
                              Primary
                            </span>
                          )}
                          {isActive && !org.is_primary && (
                            <span className="inline-flex items-center gap-1 rounded-full text-xs font-medium px-2.5 py-0.5 bg-[#3F704D]/10 text-[#3F704D]">
                              <Check className="h-3 w-3" />
                              Active
                            </span>
                          )}
                        </div>
                        {org.description && (
                          <p className="mt-1 text-sm text-[#55514B] line-clamp-2">
                            {org.description}
                          </p>
                        )}
                        {org.website && (
                          <a
                            href={org.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1.5 text-sm text-[#55514B] hover:text-[#D97757]"
                          >
                            <Globe className="h-3.5 w-3.5" />
                            {org.website}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {!isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentOrganization(org)}
                          className="rounded-full border-[#E8DFD3] hover:bg-[#F0E6D6]"
                        >
                          Switch to
                        </Button>
                      )}
                      {!org.is_primary && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMakePrimary(org)}
                          className="rounded-full hover:bg-[#F0E6D6]"
                        >
                          <Star className="mr-1.5 h-3.5 w-3.5" />
                          Set primary
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(org)}
                        className="rounded-full hover:bg-[#F0E6D6]"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={organizations.length === 1}
                        onClick={() => setDeleteTarget(org)}
                        className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">
              {editing ? 'Edit organization' : 'New organization'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Update the details for this organization.'
                : 'Group your events under a shared organization.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="org-name">Name</Label>
              <Input
                id="org-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Acme Events Co."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-website">Website</Label>
              <Input
                id="org-website"
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-description">Description</Label>
              <Textarea
                id="org-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="A short description of this organization"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDialogOpen(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#1B1A17] text-[#FAF6F1] hover:bg-[#2D2B26] rounded-full"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? 'Save changes' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this organization?</AlertDialogTitle>
            <AlertDialogDescription>
              Events linked to {deleteTarget?.name} will be unlinked but not deleted. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
