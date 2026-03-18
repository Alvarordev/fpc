"use client"

import {
  BarChart,
  Bar,
  AreaChart,
  Area,
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

const callcenterBarData = [
  { dia: "Lun", llamadas: 18 },
  { dia: "Mar", llamadas: 22 },
  { dia: "Mié", llamadas: 15 },
  { dia: "Jue", llamadas: 28 },
  { dia: "Vie", llamadas: 24 },
  { dia: "Sáb", llamadas: 9 },
  { dia: "Dom", llamadas: 4 },
]

const callcenterAreaData = [
  { mes: "Oct", inscripciones: 14 },
  { mes: "Nov", inscripciones: 19 },
  { mes: "Dic", inscripciones: 11 },
  { mes: "Ene", inscripciones: 22 },
  { mes: "Feb", inscripciones: 27 },
  { mes: "Mar", inscripciones: 34 },
]

const voluntarioBarData = [
  { semana: "Sem 1", horas: 14 },
  { semana: "Sem 2", horas: 18 },
  { semana: "Sem 3", horas: 12 },
  { semana: "Sem 4", horas: 18 },
]

const voluntarioPieData = [
  { name: "Activo", value: 2 },
  { name: "Seguimiento", value: 2 },
  { name: "Tratamiento", value: 1 },
  { name: "Alta", value: 1 },
]

const fundacionAreaData = [
  { mes: "Oct", pacientes: 220 },
  { mes: "Nov", pacientes: 238 },
  { mes: "Dic", pacientes: 245 },
  { mes: "Ene", pacientes: 258 },
  { mes: "Feb", pacientes: 272 },
  { mes: "Mar", pacientes: 284 },
]

const fundacionPieData = [
  { name: "Mama", value: 98 },
  { name: "Cuello uterino", value: 72 },
  { name: "Próstata", value: 54 },
  { name: "Pulmón", value: 38 },
  { name: "Otro", value: 22 },
]

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

const callcenterBarConfig: ChartConfig = {
  llamadas: { label: "Llamadas", color: "var(--chart-2)" },
}

const callcenterAreaConfig: ChartConfig = {
  inscripciones: { label: "Inscripciones", color: "var(--chart-1)" },
}

const voluntarioBarConfig: ChartConfig = {
  horas: { label: "Horas", color: "var(--chart-3)" },
}

const voluntarioPieConfig: ChartConfig = {
  Activo: { label: "Activo", color: "var(--chart-1)" },
  Seguimiento: { label: "Seguimiento", color: "var(--chart-2)" },
  Tratamiento: { label: "En tratamiento", color: "var(--chart-3)" },
  Alta: { label: "Alta médica", color: "var(--chart-4)" },
}

const fundacionAreaConfig: ChartConfig = {
  pacientes: { label: "Pacientes", color: "var(--chart-2)" },
}

const fundacionPieConfig: ChartConfig = {
  Mama: { label: "Mama", color: "var(--chart-1)" },
  "Cuello uterino": { label: "Cuello uterino", color: "var(--chart-2)" },
  Próstata: { label: "Próstata", color: "var(--chart-3)" },
  Pulmón: { label: "Pulmón", color: "var(--chart-4)" },
  Otro: { label: "Otro", color: "var(--chart-5)" },
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

      <ChartCard title="Inscripciones por mes">
        <ChartContainer config={callcenterAreaConfig} className="h-[200px]">
          <AreaChart data={callcenterAreaData}>
            <defs>
              <linearGradient id="fillInscripciones" x1="0" y1="0" x2="0" y2="1">
                <stop offset="10%" stopColor="var(--chart-1)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="inscripciones"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#fillInscripciones)"
              dot={false}
            />
          </AreaChart>
        </ChartContainer>
      </ChartCard>
    </div>
  )
}

function VoluntarioCharts() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ChartCard title="Horas de voluntariado por semana">
        <ChartContainer config={voluntarioBarConfig} className="h-[200px]">
          <BarChart data={voluntarioBarData} barCategoryGap="35%">
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="semana" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="horas" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </ChartCard>

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

function FundacionCharts() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ChartCard title="Pacientes registrados por mes">
        <ChartContainer config={fundacionAreaConfig} className="h-[200px]">
          <AreaChart data={fundacionAreaData}>
            <defs>
              <linearGradient id="fillPacientes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="10%" stopColor="var(--chart-2)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="pacientes"
              stroke="var(--chart-2)"
              strokeWidth={2}
              fill="url(#fillPacientes)"
              dot={false}
            />
          </AreaChart>
        </ChartContainer>
      </ChartCard>

      <ChartCard title="Distribución por diagnóstico">
        <ChartContainer config={fundacionPieConfig} className="h-[200px]">
          <PieChart>
            <Pie
              data={fundacionPieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
            >
              {fundacionPieData.map((_, i) => (
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
}

export function DashboardCharts({ role }: DashboardChartsProps) {
  if (role === "callcenter") return <CallcenterCharts />
  if (role === "voluntario") return <VoluntarioCharts />
  return <FundacionCharts />
}
