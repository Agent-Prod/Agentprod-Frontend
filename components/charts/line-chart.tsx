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
  connection_count?: number;
  connected_count?: number;
}

export function LineChartComponent({
  mailGraphData,
  contactsData,
  connectionData,
  connectedData,
}: {
  mailGraphData: DataPoint[];
  contactsData: DataPoint[];
  connectionData: DataPoint[];
  connectedData: DataPoint[];
}) {
  if (!mailGraphData || !Array.isArray(mailGraphData)) {
    return null;
  }

  const mergeDataByDate = (
    emailData: DataPoint[],
    leadsData: DataPoint[],
    connectionsData: DataPoint[],
    connectedData: DataPoint[]
  ): DataPoint[] => {
    const mergedData: { [key: string]: DataPoint } = {};

    // Helper function to format date consistently
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
    };

    // Get the date range
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Create an array of all dates in the last 30 days
    const dates: string[] = [];
    for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
      dates.push(formatDate(d.toISOString()));
    }

    // Initialize all dates with zero values
    dates.forEach(date => {
      mergedData[date] = {
        date,
        email_count: 0,
        leads_count: 0,
        connection_count: 0,
        connected_count: 0
      };
    });

    // Merge email data
    emailData.forEach(item => {
      const date = formatDate(item.date);
      if (mergedData[date]) {
        mergedData[date].email_count = item.email_count;
      }
    });

    // Merge leads data
    leadsData.forEach(item => {
      const date = formatDate(item.date);
      if (mergedData[date]) {
        mergedData[date].leads_count = item.leads_count;
      }
    });

    // Merge connection data
    if (Array.isArray(connectionsData)) {
      connectionsData.forEach(item => {
        const date = formatDate(item.date);
        if (mergedData[date]) {
          mergedData[date].connection_count = item.connection_count;
        }
      });
    }

    // Merge connected data
    if (Array.isArray(connectedData)) {
      connectedData.forEach(item => {
        const date = formatDate(item.date);
        if (mergedData[date]) {
          mergedData[date].connected_count = item.connection_count;
        }
      });
    }

    // Convert to array, sort by date, and filter to last 30 days
    return Object.values(mergedData)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= thirtyDaysAgo && itemDate <= today;
      });
  };

  const sortedData = mergeDataByDate(mailGraphData, contactsData, connectionData, connectedData);

  // Format dates for display
  const formattedData = sortedData.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }));

  // Debug logs
  console.log('Raw Connection Data:', connectionData);
  console.log('Merged and Sorted Data:', sortedData);
  console.log('Final Formatted Data:', formattedData);

  const dataMax = Math.max(
    ...formattedData.flatMap((item) => [
      item.email_count || 0,
      item.leads_count || 0,
      item.connection_count || 0,
      item.connected_count || 0,
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
        data={formattedData}
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
        <Line
          name="LinkedIn Connection Sent"
          type="monotone"
          dataKey="connection_count"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
        <Line
          name="LinkedIn Connection Accepted"
          type="monotone"
          dataKey="connected_count"
          stroke="#8b5cf6"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}