import { Link, useLocation } from "wouter"
import { LayoutDashboard, Users, Tag, Building2, Sparkles, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/offers", label: "Offers", icon: Tag },
  { href: "/brands", label: "MAF Brands", icon: Building2 },
  { href: "/insights", label: "AI Insights", icon: Sparkles },
]

export function Sidebar() {
  const [location] = useLocation()

  return (
    <aside className="w-72 bg-card/40 backdrop-blur-2xl border-r border-white/10 flex flex-col h-screen sticky top-0">
      <div className="p-8 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent p-[1px] shadow-lg shadow-primary/20">
          <div className="w-full h-full bg-background rounded-[11px] flex items-center justify-center overflow-hidden">
             <img src={`${import.meta.env.BASE_URL}images/maf-logo.png`} alt="MAF Logo" className="w-8 h-8 object-contain" />
          </div>
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-white tracking-wide">MAF<span className="text-primary">Loyalty</span></h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Enterprise</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href))
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 group relative overflow-hidden",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
              )}
              <item.icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-6 border-t border-white/10">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors font-medium">
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
