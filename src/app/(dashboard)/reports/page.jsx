import DailyUptimePieChart from "@/components/DailyUptimePieChart";
import MonthlyBotUsageChart from "@/components/MonthlyBotUsageChart";
import EfficiencyGaugeChart from "@/components/EfficiencyGaugeChart";

export default function Reports() {
  return (
    <div className="p-6 flex flex-col sm:flex-row sm:flex-wrap gap-4">
      <div className="flex-1 sm:flex-[2]  flex">
        <DailyUptimePieChart />
      </div>
      <div className="flex-1 sm:flex-[1] flex">
        <MonthlyBotUsageChart />
      </div>
      <div className="flex-1 sm:flex-[1] flex sm:order-3">
        <EfficiencyGaugeChart />
      </div>
    </div>
  );
}
