import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const RecommendedJobs = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const response = await API.get('/student/recommendations');
                setRecommendations(response.data);
            } catch (err) {
                setError('Failed to load recommendations');
            } finally {
                setLoading(false);
            }
        };
        fetchRecommendations();
    }, []);

    const getScoreColor = (score) => {
        if (score >= 80) return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-400' };
        if (score >= 60) return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-400' };
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-400' };
    };

    const parseBranches = (branchesJson) => {
        try {
            return JSON.parse(branchesJson).join(', ');
        } catch {
            return branchesJson;
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Finding your best matches...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div>
            {recommendations.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No recommendations available at the moment.</p>
                    <p className="text-gray-400 text-sm mt-2">Check back when new jobs are posted!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.map((job) => {
                        const colors = getScoreColor(job.matchScore);
                        return (
                            <div key={job.id} className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-l-4 ${colors.border}`}>
                                {/* Match Score Badge */}
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-bold text-gray-800">{job.title}</h3>
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${colors.bg} ${colors.text}`}>
                                        {job.matchScore}% Match
                                    </span>
                                </div>

                                <p className="text-gray-600 font-medium mb-2">{job.companyName}</p>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{job.description}</p>

                                {/* Job Details */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">💰 CTC:</span>
                                        <span>{job.ctcMin} - {job.ctcMax} LPA</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">📅 Deadline:</span>
                                        <span>{new Date(job.deadline).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">⭐ CGPA:</span>
                                        <span>{job.requiredCgpa}+</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">🎓 Branches:</span>
                                        <span className="text-xs">{parseBranches(job.allowedBranches)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">📊 Openings:</span>
                                        <span>{job.numOpenings}</span>
                                    </div>
                                </div>

                                {/* Match Score Bar */}
                                <div className="mt-4">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-500">Match Score</span>
                                        <span className={`font-bold ${colors.text}`}>{job.matchScore}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-500 ${job.matchScore >= 80 ? 'bg-green-500' :
                                                    job.matchScore >= 60 ? 'bg-yellow-500' : 'bg-gray-400'
                                                }`}
                                            style={{ width: `${job.matchScore}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RecommendedJobs;
