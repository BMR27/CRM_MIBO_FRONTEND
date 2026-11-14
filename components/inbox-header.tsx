"use client"

import { Filter, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTenantBranding } from "@/hooks/use-tenant-branding"

export function InboxHeader() {
  const branding = useTenantBranding()
  const hasBranding = Boolean(branding.logoUrl || branding.displayName)

  return (
    <div className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex min-w-0 items-center gap-2.5">
        {hasBranding && (
          <>
            {branding.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={branding.logoUrl}
                alt={branding.displayName || branding.name || "Logo"}
                className="h-8 w-8 shrink-0 rounded-md object-contain"
              />
            ) : null}
            {branding.displayName && (
              <span className="truncate text-sm font-semibold text-foreground">{branding.displayName}</span>
            )}
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Exportar</DropdownMenuItem>
            <DropdownMenuItem>Configuración</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
