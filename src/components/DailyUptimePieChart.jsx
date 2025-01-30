"use client";

import { Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { label: "Lunes", time: 12, fill: "#000000" }, // Black
  { label: "Martes", time: 12, fill: "#0052FF" }, // Blue
  { label: "Miércoles", time: 12, fill: "#0096D6" }, // Teal
  { label: "Jueves", time: 12, fill: "#005277" }, // Dark Teal
  { label: "Elemento 5", time: 12, fill: "#30355C" }, // Dark Blue
];

const chartConfig = {
  time: {
    label: "Minutes",
  },
  Lunes: {
    label: "Lunes",
    color: "hsl(var(--chart-1))",
  },
  Martes: {
    label: "Martes",
    color: "hsl(var(--chart-2))",
  },
  Miércoles: {
    label: "Miércoles",
    color: "hsl(var(--chart-3))",
  },
  Jueves: {
    label: "Jueves",
    color: "hsl(var(--chart-4))",
  },
  Elemento5: {
    label: "Elemento 5",
    color: "hsl(var(--chart-5))",
  },
};

export default function DailyUptimePieChart() {
  return (
    <Card className="flex flex-col w-full  overflow-hidden h-[460px] p-4">
      <CardContent className="flex-1 px-2 py-0">
        <div className="my-4">
          <table className="w-full font-[600] text-left border-collapse">
            <tbody>
              <tr>
                <td className="border p-2">Bots Executed</td>
                <td className="border text-right p-2">11</td>
              </tr>
              <tr>
                <td className="border p-2">Daily Uptime</td>
                <td className="border text-right p-2">12 min.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ChartContainer className="px-0 py-0" config={chartConfig}>
          <div className="w-full flex justify-center">
            <PieChart className="" width={500} height={300}>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={chartData}
                dataKey="time"
                nameKey="label"
                labelLine={false}
                label={({ payload, ...props }) => {
                  return (
                    <text
                      cx={props.cx}
                      cy={props.cy}
                      x={props.x}
                      y={props.y}
                      textAnchor={props.textAnchor}
                      dominantBaseline={props.dominantBaseline}
                      fill="hsla(var(--foreground))"
                    >
                      <tspan>{payload.label}</tspan>
                      <tspan x={props.x} dy="1.2em">
                        {" "}
                        {/* Adjust dy for spacing */}
                        {payload.time}
                      </tspan>
                    </text>
                  );
                }}
                isAnimationActive={true}
              />
            </PieChart>
          </div>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
