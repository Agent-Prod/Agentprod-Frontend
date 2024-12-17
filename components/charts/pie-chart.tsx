import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ContactStatusData {
    name: string;
    value: number;
}

interface PieChartProps {
    data: {
        replies: number;
        contacts_status_map: {
            DUPLICATE?: number;
            PROCESSING?: number;
            INVALID_EMAIL?: number;
            PROCESSED?: number;
        };
    };
}

const COLORS = {
    DUPLICATE: '#FF8042',
    PROCESSING: '#34D399',
    INVALID_EMAIL: '#EF4444',
    PROCESSED: '#3B82F6'
};

const STATUS_LABELS = {
    DUPLICATE: 'Duplicate',
    PROCESSING: 'Processing',
    INVALID_EMAIL: 'Invalid Email',
    PROCESSED: 'Processed',
};

export function ContactStatusPieChart({ data }: PieChartProps) {
    const chartData: ContactStatusData[] = Object.entries(data.contacts_status_map)
        .map(([key, value]) => ({
            name: STATUS_LABELS[key as keyof typeof STATUS_LABELS] || key,
            value: value || 0,
        }))
        .filter(item => item.value > 0);

    const totalContacts = chartData.reduce((sum, item) => sum + item.value, 0);

    const renderCustomizedLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
    }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return percent > 0.05 ? (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="12px"
                fontWeight="bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        ) : null;
    };

    return (
        <div className="w-full h-[400px] p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Contact Status Distribution</h3>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={120}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[entry.name.toUpperCase().replace(' ', '_') as keyof typeof COLORS]}
                                stroke="white"
                                strokeWidth={2}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number, name: string) => [
                            `${value.toLocaleString()} contacts (${((value / totalContacts) * 100).toFixed(1)}%)`,
                            name
                        ]}
                        contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.98)",
                            border: "none",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                            padding: "8px 12px",
                        }}
                    />
                    <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        iconType="circle"
                        iconSize={10}
                        wrapperStyle={{
                            paddingLeft: "20px",
                            fontSize: "14px",
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="text-center text-sm text-gray-500 mt-2">
                Total Contacts: {totalContacts.toLocaleString()}
            </div>
        </div>
    );
}