"use client"

import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { navConfig } from "@/lib/navigation"
import { useAuthStore } from "@/store/auth-store"

export function AppSidebar() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role ?? "callcenter"
  const groups = navConfig[role]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold shrink-0">
                F
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold text-sm text-sidebar-foreground">
                  FPC
                </span>
                <span className="text-[11px] text-sidebar-foreground/50 leading-none">
                  Fundación Peruana de Cáncer
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain groups={groups} />
      </SidebarContent>

      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
