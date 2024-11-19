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
  emails: number;
  new_emails: number;
}

export function LineChartComponent({
  mailGraphData,
}: {
  mailGraphData: DataPoint[];
}) {
  // Add null check at the start of the component
  if (!mailGraphData || !Array.isArray(mailGraphData)) {
    return null; // or return a loading state/error message component
  }

  // Function to aggregate data by day
  const aggregateDataByDay = (data: DataPoint[]): DataPoint[] => {
    const aggregatedData: { [key: string]: DataPoint } = {};
    data.forEach((item) => {
      const date = new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          new Date(item.date).getFullYear() !== new Date().getFullYear()
            ? "numeric"
            : undefined,
      });
      if (!aggregatedData[date]) {
        aggregatedData[date] = { date, emails: 0, new_emails: 0 };
      }
      aggregatedData[date].emails += item.emails;
      aggregatedData[date].new_emails += item.new_emails;
    });
    return Object.values(aggregatedData);
  };

  // Sort the data by date in ascending order
  const sortedData = [...mailGraphData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Aggregate and format the data
  const aggregatedData = aggregateDataByDay(sortedData);

  // Get the last 20 days of data
  const last20Days = aggregatedData.slice(-20);

  // Calculate the maximum value from the data
  const dataMax = Math.max(
    ...last20Days.flatMap((item) => [item.emails, item.new_emails])
  );

  // Round up to the nearest multiple of 10
  const maxValue = Math.ceil(dataMax / 10) * 10;

  // Generate ticks
  const generateTicks = (max: number): number[] => {
    const tickCount = 6; // Adjust this for more or fewer ticks
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
        <Legend />
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => Math.round(value).toString()}
          domain={[0, maxValue]}
          ticks={yAxisTicks}
        />
        <Tooltip />
        {/* <Line
          name="Emails sent"
          type="monotone"
          dataKey="emails"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        /> */}
        <Line
          name="Emails Sent EveryDay"
          type="monotone"
          dataKey="new_emails"
          stroke="#82ca9d"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}