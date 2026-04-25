'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Smile, Loader2, Check, AlertCircle } from 'lucide-react';
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerSearch,
  EmojiPickerFooter
} from '@/components/ui/emoji-picker';
import { createSubdomainAction } from '@/app/actions';
import { rootDomain, getSiteUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';

type CreateState = {
  error?: string;
  success?: boolean;
  subdomain?: string;
  icon?: string;
};

function SubdomainInput({ defaultValue }: { defaultValue?: string }) {
  return (
    <div className="space-y-2.5">
      <Label 
        htmlFor="subdomain" 
        className="text-sm font-medium text-foreground"
      >
        Site name
      </Label>
      <div className="flex items-center">
        <Input
          id="subdomain"
          name="subdomain"
          placeholder="my-app"
          defaultValue={defaultValue}
          className="w-full rounded-r-none border-r-0 bg-background focus-visible:ring-0 focus-visible:ring-offset-0"
          required
          autoComplete="off"
          spellCheck={false}
        />
        <span className="px-3 py-2 border border-l-0 border-input rounded-r-md bg-muted/30 text-muted-foreground text-sm font-medium">
          /s/
        </span>
      </div>
      <p className="text-xs text-muted-foreground/80">
        Letters, numbers, and hyphens only. 3-63 characters.
      </p>
    </div>
  );
}

function IconPicker({
  icon,
  setIcon,
  defaultValue
}: {
  icon: string;
  setIcon: (icon: string) => void;
  defaultValue?: string;
}) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleEmojiSelect = ({ emoji }: { emoji: string }) => {
    setIcon(emoji);
    setIsPickerOpen(false);
  };

  return (
    <div className="space-y-2.5">
      <Label className="text-sm font-medium text-foreground">
        Emoji icon
      </Label>
      <input type="hidden" name="icon" value={icon} required />
      
      <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-between h-12 px-3 font-normal transition-all duration-200 hover:bg-secondary/50",
              !icon && "text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-md flex items-center justify-center text-xl transition-colors",
                icon ? "bg-secondary" : "bg-muted/50"
              )}>
                {icon ? icon : <Smile className="w-4 h-4 text-muted-foreground" />}
              </div>
              <span className="text-sm">
                {icon ? "Icon selected" : "Choose an emoji"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {isPickerOpen ? "Close" : "Open"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 w-[280px]"
          align="start"
          sideOffset={8}
        >
          <EmojiPicker
            className="h-[320px] w-[280px]"
            defaultValue={defaultValue}
            onEmojiSelect={handleEmojiSelect}
          >
            <EmojiPickerSearch />
            <EmojiPickerContent />
            <EmojiPickerFooter />
          </EmojiPicker>
        </PopoverContent>
      </Popover>
      
      <p className="text-xs text-muted-foreground/80">
        Pick an emoji that represents your project
      </p>
    </div>
  );
}

export function SubdomainForm() {
  const [icon, setIcon] = useState('');

  const [state, action, isPending] = useActionState<CreateState, FormData>(
    createSubdomainAction,
    {}
  );

  const isValid = icon && !isPending;

  return (
    <form action={action} className="space-y-6">
      <SubdomainInput defaultValue={state?.subdomain} />

      <IconPicker icon={icon} setIcon={setIcon} defaultValue={state?.icon} />

      {/* Error message */}
      {state?.error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive">{state.error}</p>
        </div>
      )}

      {/* Success message */}
      {state?.success && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
          <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-emerald-900">Site created!</p>
            <p className="text-emerald-700/80 mt-0.5">
              {getSiteUrl(state.subdomain || '')} is ready to use.
            </p>
          </div>
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full h-11 text-sm font-medium transition-all duration-200"
        disabled={!isValid}
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating...
          </>
        ) : (
          'Create site'
        )}
      </Button>
    </form>
  );
}
