import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
    PieChart, Pie, Cell,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
    BarChart, Bar, ResponsiveContainer
} from 'recharts';

const AnalyticsDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await API.get('/admin/analytics/dashboard');
                setAnalytics(response.data);
            } catch (err) {
                console.error("Error fetching analytics:", err);
                setError("Failed to load analytics data.");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading analytics...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!analytics) return null;

    const { overallStats, placementByBranch, monthlyTrend, topRecruiters } = analytics;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Placement Analytics Dashboard</h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Students"
                    value={overallStats.totalStudents}
                    icon="🎓"
                    color="border-blue-500"
                />
                <StatCard
                    title="Placement Rate"
                    value={`${overallStats.placementPercentage}%`}
                    icon="📈"
                    color="border-green-500"
                />
                <StatCard
                    title="Placed Students"
                    value={overallStats.placedStudents}
                    icon="✅"
                    color="border-purple-500"
                />
                <StatCard
                    title="Avg CTC"
                    value={`${overallStats.averageCtc} LPA`}
                    icon="💰"
                    color="border-yellow-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Placement by Branch - Pie Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Placement by Branch</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={placementByBranch}
                                    dataKey="placedStudents"
                                    nameKey="branch"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {placementByBranch.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Monthly Trend - Line Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Monthly Placement Trend</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <RechartsTooltip />
                                <Legend />
                                <Line type="monotone" dataKey="placementsCount" stroke="#8884d8" name="Placements" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Recruiters - Bar Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Top Recruiters</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topRecruiters}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="companyName" />
                                <YAxis />
                                <RechartsTooltip />
                                <Legend />
                                <Bar dataKey="hiresCount" fill="#00C49F" name="Students Hired" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${color} flex justify-between items-center transition hover:shadow-lg`}>
        <div>
            <p className="text-gray-500 text-sm uppercase tracking-wide font-semibold">{title}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
    </div>
);

export default AnalyticsDashboard;
