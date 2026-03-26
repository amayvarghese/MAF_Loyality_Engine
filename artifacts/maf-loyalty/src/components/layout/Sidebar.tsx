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
    <aside className="w-72 bg-white/80 backdrop-blur-2xl border-r border-black/5 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <div className="bg-gradient-to-r from-[#2C2C2E] to-[#3A3020] rounded-2xl p-4 flex items-center justify-center">
          <img src={`${import.meta.env.BASE_URL}images/maf-logo.png`} alt="MAF Logo" className="h-10 w-auto object-contain" />
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href))
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 relative",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-[#1D1D1F] hover:bg-black/5"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
              )}
              <item.icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-6">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors font-medium">
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}