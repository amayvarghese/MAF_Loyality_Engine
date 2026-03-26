import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { TierBadge } from "./Customers"
import { useGetCustomer, useGenerateOffers, getGetCustomerQueryKey, getListOffersQueryKey } from "@workspace/api-client-react"
import { useRoute } from "wouter"
import { formatNumber, formatCurrency } from "@/lib/utils"
import { Sparkles, Calendar, Tag, CreditCard, Award, ArrowLeft, History } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Link } from "wouter"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

export default function CustomerDetail() {
  const [, params] = useRoute("/customers/:id")
  const id = parseInt(params?.id || "0")
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: customer, isLoading } = useGetCustomer(id, {
    query: { enabled: !!id, queryKey: getGetCustomerQueryKey(id) },
  })
  
  const generateOffers = useGenerateOffers({
    mutation: {
      onSuccess: () => {
        toast({ title: "AI Offers Generated", description: "Successfully analyzed cross-brand behavior and generated personalized offers." })
        queryClient.invalidateQueries({ queryKey: getGetCustomerQueryKey(id) })
        queryClient.invalidateQueries({ queryKey: getListOffersQueryKey() })
      },
      onError: (err) => {
        const description =
          err instanceof Error ? err.message : "Failed to generate offers.";
        toast({
          title: "Could not generate offers",
          description,
          variant: "destructive",
        });
      },
    }
  })

  if (isLoading) return <AppLayout><div className="h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div></AppLayout>
  if (!customer) return <AppLayout><div className="text-center py-20 text-foreground">Customer not found</div></AppLayout>

  const isGenerating = generateOffers.isPending

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <Link href="/customers" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Customers
            </Link>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-display font-bold text-foreground">{customer.name}</h1>
              <TierBadge tier={customer.tier} />
            </div>
            <p className="text-muted-foreground flex items-center gap-4">
              <span>{customer.email}</span>
              {customer.phone && <span>• {customer.phone}</span>}
              <span className="flex items-center"><Calendar className="w-4 h-4 mr-1"/> Joined {new Date(customer.joinedAt).getFullYear()}</span>
            </p>
          </div>
          
          <Button 
            className="bg-primary text-primary-foreground shadow-sm shadow-primary/20"
            size="lg"
            disabled={isGenerating}
            onClick={() => generateOffers.mutate({ data: { customerId: id } })}
          >
            {isGenerating ? <Spinner size="sm" className="text-white" /> : <Sparkles className="w-5 h-5 mr-2" />}
            {isGenerating ? "Analyzing Behavior..." : "Generate AI Weekly Offers"}
          </Button>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Award className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Points Balance</p>
                <h3 className="text-3xl font-display font-bold text-foreground">{formatNumber(customer.totalPoints)}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Lifetime Spend</p>
                <h3 className="text-3xl font-display font-bold text-foreground">
                  {formatCurrency(customer.brandSpend?.reduce((acc, curr) => acc + curr.totalSpend, 0) || 0)}
                </h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Tag className="w-7 h-7 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Offers</p>
                <h3 className="text-3xl font-display font-bold text-foreground">
                  {customer.offers?.filter(o => o.status === 'active').length || 0}
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Cross-Brand Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={customer.brandSpend || []} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                      <XAxis type="number" stroke="#6E6E73" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `${v/1000}k`} />
                      <YAxis dataKey="brandName" type="category" stroke="#1D1D1F" fontSize={13} tickLine={false} axisLine={false} />
                      <Tooltip 
                        cursor={{fill: 'rgba(0,0,0,0.04)'}}
                        contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', color: '#1D1D1F', backdropFilter: 'blur(10px)' }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Bar dataKey="totalSpend" radius={[0, 6, 6, 0]} barSize={24}>
                        {(customer.brandSpend || []).map((_, index) => (
                          <Cell key={`cell-${index}`} fill="url(#blueGradient)" />
                        ))}
                      </Bar>
                      <defs>
                        <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity={1} />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><History className="w-5 h-5"/> Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {(!customer.transactions || customer.transactions.length === 0) ? (
                  <div className="text-center py-8 text-muted-foreground">No recent transactions</div>
                ) : (
                  <div className="space-y-4">
                    {customer.transactions.slice(0, 5).map(tx => (
                      <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-black/5 hover:border-black/10 transition-colors">
                        <div>
                          <p className="font-semibold text-foreground">{tx.brandName}</p>
                          <p className="text-sm text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{formatCurrency(tx.amount)}</p>
                          <p className="text-sm text-emerald-600">+{tx.pointsEarned} pts</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            <Card className="border-primary/20 relative overflow-hidden bg-white/80">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-rose-300" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Sparkles className="w-5 h-5" /> AI Personalized Offers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(!customer.offers || customer.offers.length === 0) ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    No active offers. Generate some using the AI engine.
                  </div>
                ) : (
                  customer.offers.filter(o => o.status === 'active').map(offer => (
                    <div key={offer.id} className="p-4 rounded-xl bg-white border border-black/5 shadow-sm relative group">
                      <div className="mb-2">
                        <Badge variant="outline" className="mb-2 border-primary/30 text-primary bg-primary/5">
                          {offer.brandName}
                        </Badge>
                        <h4 className="font-semibold text-foreground">{offer.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{offer.description}</p>
                      {offer.aiReason && (
                        <div className="mt-3 pt-3 border-t border-black/5">
                          <p className="text-xs text-purple-600 flex items-start gap-1.5">
                            <Sparkles className="w-3 h-3 mt-0.5 shrink-0" />
                            <span className="italic">"{offer.aiReason}"</span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}