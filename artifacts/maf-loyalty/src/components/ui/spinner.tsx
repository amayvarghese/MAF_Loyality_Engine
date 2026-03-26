import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function Spinner({ className, size = "default" }: { className?: string, size?: "sm" | "default" | "lg" }) {
  return (
    <Loader2 
      className={cn(
        "animate-spin text-primary", 
        size === "sm" && "w-4 h-4",
        size === "default" && "w-8 h-8",
        size === "lg" && "w-12 h-12",
        className
      )} 
    />
  )
}
