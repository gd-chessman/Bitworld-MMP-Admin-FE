"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { CategoryTokenTable } from "@/components/category-token-table"
import { AddCategoryDialog } from "@/components/add-category-dialog"
import { useQuery } from "@tanstack/react-query"
import { getCategoryToken } from "@/services/api/CategorysTokenService"
import { useState } from "react"
import { useLang } from "@/lang/useLang"

export default function CategoriesTokenPage() {
  const { t } = useLang()
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categoryToken, refetch: refetchCategoryToken } = useQuery({
    queryKey: ["category-token", searchQuery],
    queryFn: () => getCategoryToken(searchQuery, 1, 100),
  });
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('categories-token.pageTitle')}</h2>
        <p className="text-muted-foreground">{t('categories-token.description')}</p>
      </div>

      <Card className="dashboard-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('categories-token.cardTitle')}</CardTitle>
              <CardDescription>{t('categories-token.cardDescription')}</CardDescription>
            </div>
            <div>
              <AddCategoryDialog />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder={t('categories-token.searchPlaceholder')} 
                className="pl-8 w-full md:max-w-sm"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  refetchCategoryToken();
                }}
              />
            </div>
          </div>
          <CategoryTokenTable searchQuery={searchQuery} />
        </CardContent>
      </Card>
    </div>
  )
}
