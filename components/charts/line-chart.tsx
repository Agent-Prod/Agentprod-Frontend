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

interface MailGraphItem {
  date: string;
  emails: number;
}

interface ContactItem {
  date: string;
  leads_count: number;
}

interface DataPoint {
  date: string;
  emails?: number;
  leads_count?: number;
}

export function LineChartComponent({
  mailGraphData,
  contactsData,
}: {
  mailGraphData: MailGraphItem[];
  contactsData: ContactItem[];
}) {
  // Add null check for both arrays
  if (!mailGraphData || !contactsData || !Array.isArray(mailGraphData) || !Array.isArray(contactsData)) {
    return null;
  }

  // Function to aggregate data by day
  const aggregateDataByDay = (
    mailData: MailGraphItem[],
    contactData: ContactItem[]
  ): DataPoint[] => {
    const aggregatedData: { [key: string]: DataPoint } = {};
    const dailyEmails: { [key: string]: number } = {};

    // First, sort mail data by date
    const sortedMailData = [...mailData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Process mailgraph data to get daily increments
    sortedMailData.forEach((item) => {
      const date = new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          new Date(item.date).getFullYear() !== new Date().getFullYear()
            ? "numeric"
            : undefined,
      });

      if (!dailyEmails[date]) {
        // For first entry of the day
        const previousDay = new Date(item.date);
        previousDay.setDate(previousDay.getDate() - 1);
        const prevDate = previousDay.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year:
            previousDay.getFullYear() !== new Date().getFullYear()
              ? "numeric"
              : undefined,
        });
        
        const prevDayLastEmail = sortedMailData.filter(mail => 
          new Date(mail.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: new Date(mail.date).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
          }) === prevDate
        ).pop()?.emails || 0;

        dailyEmails[date] = item.emails - prevDayLastEmail;
      } else {
        // Update with the highest increment for the day
        const prevDayLastEmail = sortedMailData.filter(mail => 
          new Date(mail.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: new Date(mail.date).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
          }) === date
        )[0]?.emails || 0;

        dailyEmails[date] = item.emails - prevDayLastEmail;
      }

      if (!aggregatedData[date]) {
        aggregatedData[date] = { date, emails: dailyEmails[date], leads_count: 0 };
      } else {
        aggregatedData[date].emails = dailyEmails[date];
      }
    });

    // Process contacts data (leads count is already daily, no need to calculate increment)
    contactData.forEach((item) => {
      const date = new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          new Date(item.date).getFullYear() !== new Date().getFullYear()
            ? "numeric"
            : undefined,
      });
      if (!aggregatedData[date]) {
        aggregatedData[date] = { date, emails: 0, leads_count: item.leads_count };
      } else {
        aggregatedData[date].leads_count = item.leads_count;
      }
    });

    return Object.values(aggregatedData);
  };

  // Sort the data by date in ascending order
  const sortedMailData = [...mailGraphData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const sortedContactData = [...contactsData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Aggregate and format the data
  const aggregatedData = aggregateDataByDay(sortedMailData, sortedContactData);

  // Get the last 20 days of data
  const last20Days = aggregatedData.slice(-20);

  // Calculate the maximum value from both metrics
  const dataMax = Math.max(
    ...last20Days.flatMap((item) => [
      item.emails || 0,
      item.leads_count || 0,
    ])
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
        <Line
          name="Email Sent Everyday"
          type="monotone"
          dataKey="emails"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
        <Line
          name="Leads Added Everyday"
          type="monotone"
          dataKey="leads_count"
          stroke="#82ca9d"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}