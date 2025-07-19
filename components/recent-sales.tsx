import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function RecentSales() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-primary/10">
            <AvatarImage src="/diverse-woman-portrait.png" alt="Avatar" />
            <AvatarFallback className="bg-primary/10 text-primary">OM</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">Olivia Martinez</p>
            <p className="text-xs text-muted-foreground">olivia.martinez@email.com</p>
          </div>
        </div>
        <div className="font-medium text-emerald-500">Active</div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-primary/10">
            <AvatarImage src="/thoughtful-man.png" alt="Avatar" />
            <AvatarFallback className="bg-primary/10 text-primary">TL</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">Thomas Lee</p>
            <p className="text-xs text-muted-foreground">thomas.lee@email.com</p>
          </div>
        </div>
        <div className="font-medium text-emerald-500">Active</div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-primary/10">
            <AvatarImage src="/woman-with-glasses.png" alt="Avatar" />
            <AvatarFallback className="bg-primary/10 text-primary">LN</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">Lisa Nguyen</p>
            <p className="text-xs text-muted-foreground">lisa.nguyen@email.com</p>
          </div>
        </div>
        <div className="font-medium text-emerald-500">Active</div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-primary/10">
            <AvatarImage src="/bearded-man-portrait.png" alt="Avatar" />
            <AvatarFallback className="bg-primary/10 text-primary">PK</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">Peter Kim</p>
            <p className="text-xs text-muted-foreground">peter.kim@email.com</p>
          </div>
        </div>
        <div className="font-medium text-emerald-500">Active</div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-primary/10">
            <AvatarImage src="/red-haired-woman.png" alt="Avatar" />
            <AvatarFallback className="bg-primary/10 text-primary">TH</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">Tara Harris</p>
            <p className="text-xs text-muted-foreground">tara.harris@email.com</p>
          </div>
        </div>
        <div className="font-medium text-emerald-500">Active</div>
      </div>
    </div>
  )
}
