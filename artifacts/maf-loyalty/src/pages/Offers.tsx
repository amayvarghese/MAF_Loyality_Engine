import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useListOffers, useRedeemOffer, getListOffersQueryKey, getGetCustomerQueryKey } from "@workspace/api-client-react"
import { formatNumber } from "@/lib/utils"
import { Tag, Sparkles, CheckCircle2 } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

export default function Offers() {
  const { data: offers, isLoading } = useListOffers()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const redeemOffer = useRedeemOffer({
    mutation: {
      onSuccess: (data) => {
        toast({ title: "Offer Redeemed", description: "The offer has been successfully processed." })
        queryClient.invalidateQueries({ queryKey: getListOffersQueryKey() })
        queryClient.invalidateQueries({ queryKey: getGetCustomerQueryKey(data.customerId) })
      }
    }
  })

  if (isLoading) return <AppLayout><div className="h-[60vh] flex items-center justify-center"><Spinner size="lg"/></div></AppLayout>

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">Campaign Offers</h1>
          <p className="text-muted-foreground">Monitor and manage AI-generated loyalty offers across the network</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers?.map(offer => (
            <Card key={offer.id} className="flex flex-col relative overflow-hidden group">
              {offer.status === 'redeemed' && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                  <div className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-4 py-2 rounded-full font-semibold flex items-center gap-2 shadow-sm bg-white/80 backdrop-blur-md">
                    <CheckCircle2 className="w-5 h-5" /> Redeemed
                  </div>
                </div>
              )}
              
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
                    {offer.brandName}
                  </Badge>
                  <span className="text-2xl font-bold text-foreground">{offer.discountPercent}% OFF</span>
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-2">{offer.title}</h3>
                <p className="text-muted-foreground text-sm flex-1">{offer.description}</p>
                
                {offer.aiReason && (
                  <div className="mt-4 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 text-xs text-purple-700 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-purple-500" />
                    <span className="italic">{offer.aiReason}</span>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Valid till: </span>
                    <span className="text-foreground font-medium">{new Date(offer.validUntil).toLocaleDateString()}</span>
                  </div>
                  <Button 
                    variant="default" 
                    size="sm"
                    className="bg-foreground text-white hover:bg-black/80 rounded-full px-6 shadow-sm"
                    disabled={offer.status !== 'active' || redeemOffer.isPending}
                    onClick={() => redeemOffer.mutate({ id: offer.id })}
                  >
                    Redeem
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}