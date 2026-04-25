"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronDown, Sparkles, Palette, Layout, Code, Brush, Rocket, User, Minimize2, Box, Leaf, Layers, Hexagon, Factory } from "lucide-react"

interface Option {
  value: string
  label: string
  description?: string
  icon?: React.ReactNode
  color?: string
}

interface SelectableCardsProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  showIcons?: boolean
}

const templateIcons: Record<string, React.ReactNode> = {
  dev: <Code className="w-5 h-5" />,
  designer: <Brush className="w-5 h-5" />,
  founder: <Rocket className="w-5 h-5" />,
  creator: <User className="w-5 h-5" />,
  minimal: <Minimize2 className="w-5 h-5" />,
}

const aestheticIcons: Record<string, React.ReactNode> = {
  editorial: <Layout className="w-5 h-5" />,
  minimal: <Minimize2 className="w-5 h-5" />,
  brutalist: <Box className="w-5 h-5" />,
  'retro-futuristic': <Sparkles className="w-5 h-5" />,
  organic: <Leaf className="w-5 h-5" />,
  maximalist: <Layers className="w-5 h-5" />,
  'art-deco': <Hexagon className="w-5 h-5" />,
  industrial: <Factory className="w-5 h-5" />,
}

const aestheticColors: Record<string, string> = {
  editorial: "from-amber-500/20 to-orange-500/20",
  minimal: "from-slate-400/20 to-gray-400/20",
  brutalist: "from-stone-600/20 to-neutral-600/20",
  'retro-futuristic': "from-purple-500/20 to-pink-500/20",
  organic: "from-emerald-500/20 to-teal-500/20",
  maximalist: "from-rose-500/20 to-yellow-500/20",
  'art-deco': "from-yellow-600/20 to-amber-600/20",
  industrial: "from-zinc-500/20 to-slate-500/20",
}

const templateColors: Record<string, string> = {
  dev: "from-blue-500/20 to-cyan-500/20",
  designer: "from-pink-500/20 to-rose-500/20",
  founder: "from-amber-500/20 to-orange-500/20",
  creator: "from-violet-500/20 to-purple-500/20",
  minimal: "from-slate-400/20 to-gray-400/20",
}

export function SelectableCards({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  className,
  showIcons = true,
}: SelectableCardsProps) {
  const [open, setOpen] = React.useState(false)
  const selectedOption = options.find((opt) => opt.value === value)

  const isTemplate = options.some((opt) => opt.value === "dev")
  const iconMap = isTemplate ? templateIcons : aestheticIcons
  const colorMap = isTemplate ? templateColors : aestheticColors

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full flex items-center justify-between gap-3 px-4 py-3",
            "bg-background border border-input rounded-lg",
            "hover:border-ring hover:ring-1 hover:ring-ring/50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "transition-all duration-200 ease-out",
            "text-left",
            className
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            {showIcons && selectedOption && (
              <div
                className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                  "bg-gradient-to-br",
                  colorMap[selectedOption.value] || "from-muted to-muted/50"
                )}
              >
                <span className="text-foreground/80">
                  {iconMap[selectedOption.value] || <Palette className="w-5 h-5" />}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <p className="font-medium text-sm text-foreground truncate">
                {selectedOption?.label || placeholder}
              </p>
              {selectedOption?.description && (
                <p className="text-xs text-muted-foreground truncate">
                  {selectedOption.description}
                </p>
              )}
            </div>
          </div>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[320px] p-2 bg-popover border-border/60"
        align="start"
        sideOffset={4}
      >
        <div 
          className="space-y-1 max-h-[280px] overflow-y-auto custom-scroll"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'hsl(var(--ring) / 0.4) transparent'
          }}
        >
          {options.map((option) => {
            const isSelected = option.value === value
            const icon = iconMap[option.value] || <Palette className="w-4 h-4" />
            const colorClass = colorMap[option.value] || "from-muted to-muted/50"

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                className={cn(
                  "w-full flex items-start gap-3 p-3 rounded-lg",
                  "transition-all duration-150 ease-out",
                  "hover:bg-accent/50",
                  isSelected && "bg-accent/80 ring-1 ring-ring/30"
                )}
              >
                <div
                  className={cn(
                    "flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center",
                    "bg-gradient-to-br",
                    colorClass,
                    "transition-transform duration-150",
                    "group-hover:scale-105"
                  )}
                >
                  <span className="text-foreground/70">{icon}</span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-medium text-sm",
                        isSelected ? "text-foreground" : "text-foreground/90"
                      )}
                    >
                      {option.label}
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    )}
                  </div>
                  {option.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {option.description}
                    </p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
