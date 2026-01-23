"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const revenueData = [
    { name: 'Mon', revenue: 4200 },
    { name: 'Tue', revenue: 3800 },
    { name: 'Wed', revenue: 5100 },
    { name: 'Thu', revenue: 4800 },
    { name: 'Fri', revenue: 6500 },
    { name: 'Sat', revenue: 8200 },
    { name: 'Sun', revenue: 7400 },
];

const serviceData = [
    { name: 'Hair Cut & Style', value: 45, color: '#6F2DBD' },
    { name: 'Coloring', value: 25, color: '#A663CC' },
    { name: 'Spa Treatment', value: 20, color: '#D4B4E8' },
    { name: 'Nail Care', value: 10, color: '#E9D5FF' },
];

export function AnalyticsSection({ theme }: { theme: string }) {
    // Theme color mapping for charts
    const getThemeColor = (theme: string) => {
        const colors = {
            royal: "#6F2DBD",
            midnight: "#171123",
            ocean: "#2563EB",
        };
        return colors[theme as keyof typeof colors] || "#6F2DBD";
    };

    const mainColor = getThemeColor(theme);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/80 backdrop-blur-md p-3 rounded-xl border border-white/50 shadow-lg">
                    <p className="text-gray-500 text-xs font-semibold mb-1">{label}</p>
                    <p className="text-gray-900 font-bold text-sm">
                        ${payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Chart A: Revenue Trends */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-2 bg-white/60 backdrop-blur-xl border border-white/40 shadow-soft rounded-3xl p-6 relative overflow-hidden"
            >
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Revenue Trends</h3>
                    <p className="text-sm text-gray-500">Weekly performance overview</p>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={mainColor} stopOpacity={0.4} />
                                    <stop offset="95%" stopColor={mainColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke={mainColor}
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Chart B: Popular Services */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-soft rounded-3xl p-6 relative"
            >
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Popular Services</h3>
                    <p className="text-sm text-gray-500">Distribution by bookings</p>
                </div>

                <div className="h-[250px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={serviceData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {serviceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Centered Total or Label if desired */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <div className="text-xs text-gray-400 font-medium">Top</div>
                        <div className="text-xl font-bold text-gray-900">4</div>
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-4 space-y-3">
                    {serviceData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-gray-600 font-medium">{item.name}</span>
                            </div>
                            <span className="font-bold text-gray-900">{item.value}%</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
