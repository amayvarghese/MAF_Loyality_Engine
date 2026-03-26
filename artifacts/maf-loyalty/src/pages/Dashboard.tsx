import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useGetAnalytics } from "@workspace/api-client-react"
import { Spinner } from "@/components/ui/spinner"
import { Users, CreditCard, Sparkles, TrendingUp } from "lucide-react"
import { formatNumber, formatCurrency } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Cell as PieCell, Legend } from "recharts"

const TIER_COLORS = {
  silver: "#9CA3AF",
  gold: "#B8963E",
  platinum: "#4B5563",
  diamond: "#06B6D4"
}

export default function Dashboard() {
  const { data: analytics, isLoading, isError, error, refetch } = useGetAnalytics()

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-[60vh] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </AppLayout>
    )
  }

  if (isError || !analytics) {
    const message =
      error instanceof Error ? error.message : "Could not load analytics."
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto mt-16 space-y-4">
          <Alert variant="destructive">
            <AlertTitle>Dashboard could not load</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{message}</p>
              <p className="text-muted-foreground">
                On Vercel, set <code className="text-xs">DATABASE_URL</code> to your
                Postgres URL, redeploy, then run{" "}
                <code className="text-xs">pnpm --filter @workspace/db run push</code> and{" "}
                <code className="text-xs">pnpm --filter @workspace/scripts run seed-maf</code>{" "}
                against that database.
              </p>
            </AlertDescription>
          </Alert>
          <Button variant="outline" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      </AppLayout>
    )
  }

  const tierData = [
    { name: "Silver", value: analytics.tierDistribution.silver, color: TIER_COLORS.silver },
    { name: "Gold", value: analytics.tierDistribution.gold, color: TIER_COLORS.gold },
    { name: "Platinum", value: analytics.tierDistribution.platinum, color: TIER_COLORS.platinum },
    { name: "Diamond", value: analytics.tierDistribution.diamond, color: TIER_COLORS.diamond },
  ]

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">Executive Overview</h1>
          <p className="text-muted-foreground">Cross-brand loyalty performance & AI impact</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">+12%</Badge>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Network Customers</p>
              <h3 className="text-3xl font-display font-bold text-foreground">{formatNumber(analytics.totalCustomers)}</h3>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Network Transactions</p>
              <h3 className="text-3xl font-display font-bold text-foreground">{formatNumber(analytics.totalTransactions)}</h3>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                </div>
                <Badge variant="outline" className="border-purple-500/30 text-purple-500 bg-purple-500/5">AI Driven</Badge>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Offer Redemption Rate</p>
              <h3 className="text-3xl font-display font-bold text-foreground">
                {analytics.weeklyOfferStats.redemptionRate.toFixed(1)}%
              </h3>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Points Issued</p>
              <h3 className="text-3xl font-display font-bold text-foreground">{formatNumber(analytics.totalPointsIssued)}</h3>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Top Performing Brands</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topBrands} margin={{ top: 10, right: 10, left: 20, bottom: 20 }}>
                    <XAxis 
                      dataKey="brandName" 
                      stroke="#6E6E73" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#6E6E73" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(0,0,0,0.04)'}}
                      contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', color: '#1D1D1F', backdropFilter: 'blur(10px)' }}
                      formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                    />
                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                      {analytics.topBrands.map((_, index) => (
                        <Cell key={`cell-${index}`} fill="url(#goldGradient)" />
                      ))}
                    </Bar>
                    <defs>
                      <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#B8963E" stopOpacity={1} />
                        <stop offset="100%" stopColor="#B8963E" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tier Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tierData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {tierData.map((entry, index) => (
                        <PieCell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                      itemStyle={{ color: '#1D1D1F' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

function Badge({ children, variant, className }: any) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  )
}