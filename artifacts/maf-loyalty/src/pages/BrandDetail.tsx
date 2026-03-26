import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useListBrands, useListTransactions, useListCustomers } from "@workspace/api-client-react"
import { Building2, ArrowLeft, TrendingUp, Users, CreditCard, Star } from "lucide-react"
import { Link, useParams } from "wouter"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, CartesianGrid
} from "recharts"
import { useMemo } from "react"

function formatCurrency(v: number) {
  return `AED ${v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}
function formatNumber(v: number) {
  return v.toLocaleString()
}

const TIER_COLORS: Record<string, string> = {
  silver: "#9CA3AF",
  gold: "#D4AF37",
  platinum: "#6B7280",
  diamond: "#60A5FA",
}
const TIER_LABELS: Record<string, string> = {
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
  diamond: "Diamond",
}

export default function BrandDetail() {
  const params = useParams<{ id: string }>()
  const brandId = Number(params.id)

  const { data: brands, isLoading: brandsLoading } = useListBrands()
  const { data: allTransactions, isLoading: txLoading } = useListTransactions({ brandId })
  const { data: customers, isLoading: customersLoading } = useListCustomers()

  const brand = brands?.find(b => b.id === brandId)

  const isLoading = brandsLoading || txLoading || customersLoading

  const stats = useMemo(() => {
    if (!allTransactions) return null
    const totalRevenue = allTransactions.reduce((sum, t) => sum + Number(t.amount), 0)
    const totalPoints = allTransactions.reduce((sum, t) => sum + t.pointsEarned, 0)
    const uniqueCustomers = new Set(allTransactions.map(t => t.customerId)).size
    const avgTransaction = allTransactions.length > 0 ? totalRevenue / allTransactions.length : 0
    return { totalRevenue, totalPoints, uniqueCustomers, avgTransaction, txCount: allTransactions.length }
  }, [allTransactions])

  const topCustomers = useMemo(() => {
    if (!allTransactions || !customers) return []
    const spendByCustomer = new Map<number, number>()
    for (const tx of allTransactions) {
      spendByCustomer.set(tx.customerId, (spendByCustomer.get(tx.customerId) ?? 0) + Number(tx.amount))
    }
    return Array.from(spendByCustomer.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([customerId, spend]) => {
        const customer = customers.find(c => c.id === customerId)
        return { customerId, spend, name: customer?.name ?? `Customer #${customerId}`, tier: customer?.tier ?? "silver" }
      })
  }, [allTransactions, customers])

  const monthlyTrend = useMemo(() => {
    if (!allTransactions) return []
    const byMonth = new Map<string, { revenue: number; count: number }>()
    for (const tx of allTransactions) {
      const d = new Date(tx.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
      const existing = byMonth.get(key) ?? { revenue: 0, count: 0, label }
      byMonth.set(key, { ...existing, revenue: existing.revenue + Number(tx.amount), count: existing.count + 1 })
    }
    return Array.from(byMonth.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, val]) => {
        const [year, month] = key.split("-")
        const label = new Date(Number(year), Number(month) - 1).toLocaleDateString("en-US", { month: "short" })
        return { month: label, revenue: val.revenue, transactions: val.count }
      })
  }, [allTransactions])

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-[60vh] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </AppLayout>
    )
  }

  if (!brand) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">Brand not found</p>
          <Link href="/brands" className="mt-4 inline-flex items-center gap-2 text-primary font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Brands
          </Link>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Back + Header */}
        <div>
          <Link href="/brands" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Brands
          </Link>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${brand.logoColor}18` }}>
              <Building2 className="w-8 h-8" style={{ color: brand.logoColor || "#B8963E" }} />
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold text-foreground">{brand.name}</h1>
              <p className="text-muted-foreground mt-1">{brand.category} · {brand.description}</p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(stats?.totalRevenue ?? 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                <CreditCard className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Transactions</p>
              <p className="text-2xl font-bold text-foreground">{formatNumber(stats?.txCount ?? 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Unique Customers</p>
              <p className="text-2xl font-bold text-foreground">{formatNumber(stats?.uniqueCustomers ?? 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                <Star className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Avg. Transaction</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(stats?.avgTransaction ?? 0)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Revenue Trend */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyTrend.length === 0 ? (
                <div className="h-[260px] flex items-center justify-center text-muted-foreground">No transaction data yet</div>
              ) : (
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="brandGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={brand.logoColor ?? "#B8963E"} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={brand.logoColor ?? "#B8963E"} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="month" stroke="#6E6E73" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis stroke="#6E6E73" tickLine={false} axisLine={false} fontSize={12} tickFormatter={v => `${v / 1000}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "rgba(255,255,255,0.95)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", backdropFilter: "blur(10px)" }}
                        formatter={(v: number) => [formatCurrency(v), "Revenue"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke={brand.logoColor ?? "#B8963E"}
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#brandGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
            </CardHeader>
            <CardContent>
              {topCustomers.length === 0 ? (
                <div className="h-[260px] flex items-center justify-center text-muted-foreground">No customers yet</div>
              ) : (
                <div className="space-y-3 pt-1">
                  {topCustomers.map((c, i) => (
                    <Link key={c.customerId} href={`/customers/${c.customerId}`}>
                      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-black/4 transition-colors cursor-pointer group">
                        <span className="w-6 text-sm font-bold text-muted-foreground">{i + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate group-hover:text-primary transition-colors">{c.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span
                              className="text-xs px-1.5 py-0.5 rounded-full font-medium capitalize"
                              style={{ backgroundColor: `${TIER_COLORS[c.tier]}20`, color: TIER_COLORS[c.tier] }}
                            >
                              {TIER_LABELS[c.tier]}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-foreground">{formatCurrency(c.spend)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {!allTransactions || allTransactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No transactions recorded for this brand yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/6">
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Customer</th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Description</th>
                      <th className="text-right py-3 px-2 text-muted-foreground font-medium">Amount</th>
                      <th className="text-right py-3 px-2 text-muted-foreground font-medium">Points</th>
                      <th className="text-right py-3 px-2 text-muted-foreground font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...allTransactions].reverse().slice(0, 15).map(tx => {
                      const customer = customers?.find(c => c.id === tx.customerId)
                      return (
                        <tr key={tx.id} className="border-b border-black/4 hover:bg-black/2 transition-colors">
                          <td className="py-3 px-2">
                            <Link href={`/customers/${tx.customerId}`} className="font-medium text-foreground hover:text-primary transition-colors">
                              {customer?.name ?? `#${tx.customerId}`}
                            </Link>
                          </td>
                          <td className="py-3 px-2 text-muted-foreground">{tx.description ?? "—"}</td>
                          <td className="py-3 px-2 text-right font-semibold text-foreground">{formatCurrency(Number(tx.amount))}</td>
                          <td className="py-3 px-2 text-right">
                            <span className="text-primary font-medium">+{tx.pointsEarned.toLocaleString()}</span>
                          </td>
                          <td className="py-3 px-2 text-right text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString("en-AE", { day: "numeric", month: "short" })}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
