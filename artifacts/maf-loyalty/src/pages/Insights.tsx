import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useGetAnalytics } from "@workspace/api-client-react"
import { Spinner } from "@/components/ui/spinner"
import { Sparkles, BrainCircuit, Target, Zap } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis } from "recharts"

export default function Insights() {
  const { data: analytics, isLoading, isError, error, refetch } = useGetAnalytics()

  if (isLoading) return <AppLayout><div className="h-[60vh] flex items-center justify-center"><Spinner size="lg"/></div></AppLayout>

  if (isError || !analytics) {
    const message =
      error instanceof Error ? error.message : "Could not load analytics."
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto mt-16 space-y-4">
          <Alert variant="destructive">
            <AlertTitle>Insights could not load</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{message}</p>
              <p className="text-muted-foreground">
                Configure <code className="text-xs">DATABASE_URL</code> on the server and ensure
                the schema is pushed and seeded.
              </p>
            </AlertDescription>
          </Alert>
          <Button variant="outline" onClick={() => void refetch()}>Retry</Button>
        </div>
      </AppLayout>
    )
  }

  // Mocking trend data for the visual since API only provides aggregate
  const trendData = [
    { name: 'Mon', generated: 400, redeemed: 240 },
    { name: 'Tue', generated: 300, redeemed: 139 },
    { name: 'Wed', generated: 520, redeemed: 380 },
    { name: 'Thu', generated: 450, redeemed: 290 },
    { name: 'Fri', generated: 600, redeemed: 480 },
    { name: 'Sat', generated: 800, redeemed: 680 },
    { name: 'Sun', generated: 750, redeemed: 590 },
  ]

  const conversionData = [
    { name: 'Redeemed', value: analytics.weeklyOfferStats.redeemed },
    { name: 'Ignored', value: analytics.weeklyOfferStats.generated - analytics.weeklyOfferStats.redeemed }
  ]
  const COLORS = ['#10B981', '#9CA3AF']

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-blue-500" /> AI Insights Engine
          </h1>
          <p className="text-muted-foreground">Real-time performance of the cross-brand personalization models</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/10">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl"><Sparkles className="w-6 h-6 text-blue-500"/></div>
              </div>
              <p className="text-muted-foreground text-sm font-medium mb-1">Offers Generated (7d)</p>
              <h3 className="text-4xl font-bold text-foreground">{analytics.weeklyOfferStats.generated}</h3>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/10">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-500/10 rounded-2xl"><Target className="w-6 h-6 text-emerald-500"/></div>
              </div>
              <p className="text-muted-foreground text-sm font-medium mb-1">Offers Redeemed (7d)</p>
              <h3 className="text-4xl font-bold text-foreground">{analytics.weeklyOfferStats.redeemed}</h3>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary/10 rounded-2xl"><Zap className="w-6 h-6 text-primary"/></div>
              </div>
              <p className="text-muted-foreground text-sm font-medium mb-1">AI Conversion Rate</p>
              <h3 className="text-4xl font-bold text-foreground">{analytics.weeklyOfferStats.redemptionRate.toFixed(1)}%</h3>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Generation vs Redemption Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#6E6E73" tickLine={false} axisLine={false} />
                    <YAxis stroke="#6E6E73" tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }} />
                    <Area type="monotone" dataKey="generated" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorGen)" />
                    <Area type="monotone" dataKey="redeemed" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRed)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversion Efficacy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={conversionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {conversionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }} />
                    <Legend verticalAlign="bottom" height={36} />
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