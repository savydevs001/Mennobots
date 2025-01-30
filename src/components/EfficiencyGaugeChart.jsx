"use client";
import GaugeChart from "react-gauge-chart";
import { Card, CardContent } from "@/components/ui/card";
export default function EfficiencyGaugeChart() {
  const value = 0.96;

  return (
    <Card className="w-full md:max-w-[400px] p-4 ">
      <CardContent className="flex h-full flex-col p-0">
        <div className="my-4">
          <table className="w-full font-[600] text-left border-collapse">
            <tbody>
              <tr>
                <td className="border p-2">Efficiency Percentage</td>
                <td className="border text-right p-2">96%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="w-full flex h-full justify-center items-center">
          <GaugeChart
            id="gauge-chart"
            nrOfLevels={30} // Number of levels in the gauge
            arcsLength={[0.2, 0.5, 0.3]} // Define lengths of each arc
            colors={["#0096D6", "#0052FF", "#000000"]} // Color for each arc
            percent={value} // The value as a percentage (0 to 1)
            style={{ height: "200px" }} // Customize height
          />
        </div>
      </CardContent>
    </Card>
  );
}
