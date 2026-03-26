import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useListBrands } from "@workspace/api-client-react"
import { Building2, ArrowRight } from "lucide-react"

export default function Brands() {
  const { data: brands, isLoading } = useListBrands()

  if (isLoading) return <AppLayout><div className="h-[60vh] flex items-center justify-center"><Spinner size="lg"/></div></AppLayout>

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">MAF Brand Directory</h1>
          <p className="text-muted-foreground">The Majid Al Futtaim ecosystem</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands?.map(brand => (
            <Card key={brand.id} className="group cursor-pointer hover:scale-[1.02] transition-transform duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center shadow-sm" style={{ backgroundColor: `${brand.logoColor}15` || 'rgba(0,0,0,0.05)' }}>
                  <Building2 className="w-8 h-8" style={{ color: brand.logoColor || '#1D1D1F' }} />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{brand.name}</h3>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">{brand.category}</p>
                <p className="text-muted-foreground line-clamp-2">{brand.description || `Experience the best of ${brand.category} with ${brand.name}.`}</p>
                
                <div className="mt-6 pt-6 border-t border-black/5 flex items-center text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 duration-300">
                  View Analytics <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}