"use client"

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { UserRole } from "@/types/auth"

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

interface ChartStats {
  patientsByPhase: Record<string, number>
  volunteersByStatus: Record<string, number>
  contactsByOrigin: Record<string, number>
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="border-border/60 shadow-none bg-card">
      <CardHeader className="pb-2 pt-5 px-5">
        <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">{children}</CardContent>
    </Card>
  )
}

function AdminCharts({ stats }: { stats?: ChartStats }) {
  const phaseData = stats
    ? Object.entries(stats.patientsByPhase).map(([name, value]) => ({ name, value }))
    : []

  const originData = stats
    ? Object.entries(stats.contactsByOrigin).map(([name, value]) => ({ name, value }))
    : []

  const phaseConfig: ChartConfig = Object.fromEntries(
    phaseData.map((d, i) => [d.name, { label: d.name, color: CHART_COLORS[i % CHART_COLORS.length] }])
  )

  const originConfig: ChartConfig = Object.fromEntries(
    originData.map((d, i) => [d.name, { label: d.name, color: CHART_COLORS[i % CHART_COLORS.length] }])
  )

  const hasPhaseData = phaseData.length > 0
  const hasOriginData = originData.length > 0

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ChartCard title="Pacientes por fase de salud">
        {hasPhaseData ? (
          <ChartContainer config={phaseConfig} className="h-[200px]">
            <PieChart>
              <Pie
                data={phaseData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              >
                {phaseData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Sin datos de fases</p>
          </div>
        )}
      </ChartCard>

      <ChartCard title="Contactos por origen">
        {hasOriginData ? (
          <ChartContainer config={originConfig} className="h-[200px]">
            <BarChart data={originData} barCategoryGap="35%">
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Sin datos de contactos</p>
          </div>
        )}
      </ChartCard>
    </div>
  )
}

// Fallback mock charts for other roles
const callcenterBarData = [
  { dia: "Lun", llamadas: 18 },
  { dia: "Mar", llamadas: 22 },
  { dia: "Mié", llamadas: 15 },
  { dia: "Jue", llamadas: 28 },
  { dia: "Vie", llamadas: 24 },
  { dia: "Sáb", llamadas: 9 },
  { dia: "Dom", llamadas: 4 },
]

const callcenterBarConfig: ChartConfig = {
  llamadas: { label: "Llamadas", color: "var(--chart-2)" },
}

const voluntarioPieData = [
  { name: "Activo", value: 2 },
  { name: "Seguimiento", value: 2 },
  { name: "Tratamiento", value: 1 },
  { name: "Alta", value: 1 },
]

const voluntarioPieConfig: ChartConfig = {
  Activo: { label: "Activo", color: "var(--chart-1)" },
  Seguimiento: { label: "Seguimiento", color: "var(--chart-2)" },
  Tratamiento: { label: "En tratamiento", color: "var(--chart-3)" },
  Alta: { label: "Alta médica", color: "var(--chart-4)" },
}

function CallcenterCharts() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ChartCard title="Llamadas por día">
        <ChartContainer config={callcenterBarConfig} className="h-[200px]">
          <BarChart data={callcenterBarData} barCategoryGap="35%">
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="dia" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="llamadas" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </ChartCard>
    </div>
  )
}

function VoluntarioCharts() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ChartCard title="Mis pacientes por estado">
        <ChartContainer config={voluntarioPieConfig} className="h-[200px]">
          <PieChart>
            <Pie
              data={voluntarioPieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
            >
              {voluntarioPieData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
          </PieChart>
        </ChartContainer>
      </ChartCard>
    </div>
  )
}

interface DashboardChartsProps {
  role: UserRole
  stats?: ChartStats
}

export function DashboardCharts({ role, stats }: DashboardChartsProps) {
  if (role === "admin") return <AdminCharts stats={stats} />
  if (role === "callcenter") return <CallcenterCharts />
  if (role === "voluntario") return <VoluntarioCharts />
  return <AdminCharts stats={stats} />
}
