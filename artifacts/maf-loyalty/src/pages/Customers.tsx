import { AppLayout } from "@/components/layout/AppLayout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useListCustomers } from "@workspace/api-client-react"
import { Link } from "wouter"
import { Search, ChevronRight } from "lucide-react"
import { useState } from "react"
import { formatNumber } from "@/lib/utils"

export default function Customers() {
  const { data: customers, isLoading } = useListCustomers()
  const [search, setSearch] = useState("")

  const filtered = customers?.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  ) || []

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">Customer Profiles</h1>
            <p className="text-muted-foreground">Manage and analyze cross-brand customer behavior</p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-3 bg-white/50 backdrop-blur-md border border-black/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-80 transition-all"
            />
          </div>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/5 bg-black/5 text-muted-foreground text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Tier</th>
                  <th className="p-4 font-medium">Total Points</th>
                  <th className="p-4 font-medium">Member Since</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <Spinner className="mx-auto" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  filtered.map((customer) => (
                    <tr key={customer.id} className="border-b border-black/5 hover:bg-black/[0.02] transition-colors group">
                      <td className="p-4">
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                      </td>
                      <td className="p-4">
                        <TierBadge tier={customer.tier} />
                      </td>
                      <td className="p-4 font-mono text-foreground">
                        {formatNumber(customer.totalPoints)}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(customer.joinedAt).toLocaleDateString('en-AE', { year: 'numeric', month: 'short' })}
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/customers/${customer.id}`}>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}

export function TierBadge({ tier }: { tier: string }) {
  const variants: Record<string, "tierSilver" | "tierGold" | "tierPlatinum" | "tierDiamond"> = {
    silver: "tierSilver",
    gold: "tierGold",
    platinum: "tierPlatinum",
    diamond: "tierDiamond"
  }
  
  return (
    <Badge variant={variants[tier.toLowerCase()] || "outline"} className="capitalize px-3 py-1 bg-white/80 backdrop-blur-md">
      {tier}
    </Badge>
  )
}