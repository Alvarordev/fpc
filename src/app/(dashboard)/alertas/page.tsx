"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { AlertsTab } from "./_components/alerts-tab"
import { HospitalsTab } from "./_components/hospitals-tab"

export default function AlertasPage() {
  return (
    <div className="space-y-5">
      <Tabs defaultValue="alertas">
        <TabsList className="mb-4">
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
          <TabsTrigger value="hospitales">Hospitales</TabsTrigger>
        </TabsList>

        <TabsContent value="alertas">
          <AlertsTab />
        </TabsContent>

        <TabsContent value="hospitales">
          <HospitalsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
