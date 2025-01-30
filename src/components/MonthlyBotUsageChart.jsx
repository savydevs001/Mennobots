"use client";

import * as React from "react";
import { Pie, PieChart, Label } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartContainer,
} from "@/components/ui/chart";

const chartData = [
  { label: "Junio", hours: 5, fill: "#000000" },
  { label: "Julio", hours: 4, fill: "#0052FF" },
  { label: "Agosto", hours: 7, fill: "#0096D6" },
  { label: "Septiembre", hours: 4, fill: "#005277" },
];

const chartConfig = {
  hours: {
    label: "Hours",
  },
  junio: {
    label: "Junio",
    color: "hsl(var(--chart-1))",
  },
  julio: {
    label: "Julio",
    color: "hsl(var(--chart-2))",
  },
  agosto: {
    label: "Agosto",
    color: "hsl(var(--chart-3))",
  },
  septiembre: {
    label: "Septiembre",
    color: "hsl(var(--chart-4))",
  },
};

export default function MonthlyBotUsageChart() {
  const totalHours = chartData.reduce((acc, curr) => acc + curr.hours, 0);

  return (
    <Card className="flex flex-col w-full h-[460px] p-4">
      <CardContent className="flex-1 p-0">
        <div className="mt-4">
          <table className="w-full font-[600] text-left border-collapse">
            <tbody>
              <tr>
                <td className="border p-2">Bot Usage Time</td>
                <td className="border text-right p-2">{totalHours} horas</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ChartContainer
          config={chartConfig}
          className="mx-auto "
        >
          <div className="w-full flex justify-center">
            <PieChart width={300} height={300} >
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={chartData}
                dataKey="hours"
                nameKey="label"
                innerRadius={50}
                outerRadius={90}
                strokeWidth={5}
                isAnimationActive={true}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalHours}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            horas
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </div>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
