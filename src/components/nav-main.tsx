"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { NavItem } from "@/types/navigation"

interface NavMainProps {
  items: NavItem[]
}

export function NavMain({ items }: NavMainProps) {
  const pathname = usePathname()

  return (
    <SidebarMenu>
      {items.map((item) => {
        const isActive = pathname === item.url
        return (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton
              render={<Link href={item.url} />}
              isActive={isActive}
              tooltip={item.title}
              className={cn(
                item.highlight && !isActive && "text-sidebar-primary font-medium"
              )}
            >
              <item.icon />
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
