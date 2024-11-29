import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  date: string;
  email_count?: number;
  leads_count?: number;
}

export function LineChartComponent({
  mailGraphData,
  contactsData,
}: {
  mailGraphData: DataPoint[];
  contactsData: DataPoint[];
}) {
  if (!mailGraphData || !Array.isArray(mailGraphData)) {
    return null;
  }

  const mergeDataByDate = (
    emailData: DataPoint[],
    leadsData: DataPoint[]
  ): DataPoint[] => {
    const mergedData: { [key: string]: DataPoint } = {};

    emailData.forEach((item) => {
      const date = new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          new Date(item.date).getFullYear() !== new Date().getFullYear()
            ? "numeric"
            : undefined,
      });
      mergedData[date] = {
        date,
        email_count: item.email_count,
        leads_count: 0,
      };
    });

    leadsData.forEach((item) => {
      const date = new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          new Date(item.date).getFullYear() !== new Date().getFullYear()
            ? "numeric"
            : undefined,
      });
      if (mergedData[date]) {
        mergedData[date].leads_count = item.leads_count;
      } else {
        mergedData[date] = {
          date,
          email_count: 0,
          leads_count: item.leads_count,
        };
      }
    });

    return Object.values(mergedData);
  };

  const sortedData = mergeDataByDate(mailGraphData, contactsData).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const last20Days = sortedData.slice(-20);

  const dataMax = Math.max(
    ...last20Days.flatMap((item) => [
      item.email_count || 0,
      item.leads_count || 0,
    ])
  );

  const maxValue = Math.ceil(dataMax / 10) * 10;

  const generateTicks = (max: number): number[] => {
    const tickCount = 6;
    const ticks = [];
    for (let i = 0; i < tickCount; i++) {
      ticks.push((max / (tickCount - 1)) * i);
    }
    return ticks;
  };

  const yAxisTicks = generateTicks(maxValue);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={last20Days}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <Legend
          verticalAlign="top"
          height={36}
          iconType="circle"
          wrapperStyle={{
            paddingBottom: "20px",
          }}
        />
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          dy={10}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => Math.round(value).toString()}
          domain={[0, maxValue]}
          ticks={yAxisTicks}
          dx={-10}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            border: "1px solid #ccc",
            borderRadius: "6px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
          labelStyle={{ color: "#666", fontWeight: "bold" }}
          itemStyle={{ padding: "4px 0" }}
        />
        <Line
          name="Emails Sent"
          type="monotone"
          dataKey="email_count"
          stroke="#6366f1"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
        <Line
          name="Leads Added"
          type="monotone"
          dataKey="leads_count"
          stroke="#22c55e"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}