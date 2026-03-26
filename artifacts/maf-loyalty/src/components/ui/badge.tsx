import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive/20 text-destructive-foreground border border-destructive/50",
        outline: "text-foreground",
        tierSilver: "border-slate-400/50 bg-slate-400/10 text-slate-300 shadow-[0_0_10px_rgba(192,192,192,0.1)]",
        tierGold: "border-yellow-500/50 bg-yellow-500/10 text-yellow-500 shadow-[0_0_10px_rgba(255,215,0,0.1)]",
        tierPlatinum: "border-zinc-300/50 bg-zinc-300/10 text-zinc-300 shadow-[0_0_10px_rgba(229,228,226,0.1)]",
        tierDiamond: "border-cyan-300/50 bg-cyan-300/10 text-cyan-300 shadow-[0_0_15px_rgba(185,242,255,0.2)]",
        success: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
