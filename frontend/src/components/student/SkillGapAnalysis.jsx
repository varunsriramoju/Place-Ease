import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DEMAND_COLORS = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#6b7280' };

const SkillGapAnalysis = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await API.get('/student/skill-gap');
                setData(response.data);
            } catch (err) {
                setError('Failed to load skill gap analysis');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Analyzing your skills...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!data) return null;

    const { studentSkills, matchingSkills, missingSkills, totalJobsAnalyzed, coveragePercentage } = data;

    return (
        <div className="space-y-6">
            {/* Coverage Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Skill Coverage Overview</h2>
                <div className="flex items-center gap-6">
                    <div className="relative w-32 h-32">
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                            <circle cx="60" cy="60" r="50" fill="none" stroke={coveragePercentage >= 60 ? '#22c55e' : coveragePercentage >= 30 ? '#f59e0b' : '#ef4444'}
                                strokeWidth="10" strokeDasharray={`${coveragePercentage * 3.14} 314`}
                                strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold">{coveragePercentage}%</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-gray-600">Based on <strong>{totalJobsAnalyzed}</strong> active job postings</p>
                        <p className="text-green-600 font-medium mt-1">✅ {matchingSkills.length} skills you have</p>
                        <p className="text-red-600 font-medium">❌ {missingSkills.length} skills to develop</p>
                    </div>
                </div>
            </div>

            {/* Your Current Skills */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">🛠️ Your Current Skills</h2>
                {studentSkills.length === 0 ? (
                    <p className="text-gray-500">No skills listed. Update your profile to see better analysis.</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {studentSkills.map((skill, i) => (
                            <span key={i} className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                ✅ {skill}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Missing Skills Chart */}
            {missingSkills.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">📈 Top Skills to Learn</h2>
                    <p className="text-sm text-gray-500 mb-4">Ranked by demand across active job postings</p>
                    <div style={{ height: Math.max(300, missingSkills.length * 40) }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={missingSkills} layout="vertical" margin={{ left: 100, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" label={{ value: 'Jobs requiring this skill', position: 'bottom' }} />
                                <YAxis type="category" dataKey="skill" width={90} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value) => [`${value} jobs`, 'Demand']} />
                                <Bar dataKey="demand" radius={[0, 4, 4, 0]}>
                                    {missingSkills.map((entry, index) => (
                                        <Cell key={index} fill={DEMAND_COLORS[entry.demandLevel] || '#6b7280'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex gap-4 mt-4 text-sm">
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> High Demand</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span> Medium</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-500 inline-block"></span> Low</span>
                    </div>
                </div>
            )}

            {/* Matching Skills */}
            {matchingSkills.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">💪 Skills You Already Have (In Demand)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {matchingSkills.map((skill, i) => (
                            <div key={i} className="flex justify-between items-center bg-green-50 rounded-lg p-3">
                                <span className="font-medium text-green-800">{skill.skill}</span>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${skill.demandLevel === 'HIGH' ? 'bg-red-100 text-red-800' :
                                        skill.demandLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}>{skill.demandLevel} ({skill.demand} jobs)</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SkillGapAnalysis;
