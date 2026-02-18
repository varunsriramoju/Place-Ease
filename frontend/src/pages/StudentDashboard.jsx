import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';
import RecommendedJobs from '../components/student/RecommendedJobs';
import SkillGapAnalysis from '../components/student/SkillGapAnalysis';
import ChatWindow from '../components/chat/ChatWindow';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('jobs');
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applyingJob, setApplyingJob] = useState(null);
    const [resume, setResume] = useState(null);

    useEffect(() => {
        fetchJobs();
        fetchApplications();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await API.get('/student/jobs');
            setJobs(response.data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchApplications = async () => {
        try {
            const response = await API.get('/student/applications');
            setApplications(response.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    };

    const parseBranches = (branchesJson) => {
        try {
            return JSON.parse(branchesJson).join(', ');
        } catch {
            return branchesJson;
        }
    };

    const handleApply = async (jobId) => {
        if (!resume) {
            alert('Please select your resume file');
            return;
        }
        const formData = new FormData();
        formData.append('resume', resume);
        try {
            await API.post(`/student/apply/${jobId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Application submitted successfully!');
            setApplyingJob(null);
            setResume(null);
            fetchJobs();
            fetchApplications();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to apply');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            APPLIED: 'bg-blue-100 text-blue-800',
            SHORTLISTED: 'bg-yellow-100 text-yellow-800',
            OFFERED: 'bg-green-100 text-green-800',
            JOINED: 'bg-emerald-100 text-emerald-800',
            REJECTED: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const tabs = [
        { id: 'jobs', label: '💼 Jobs', icon: '💼' },
        { id: 'applications', label: '📋 Applications', icon: '📋' },
        { id: 'recommendations', label: '🎯 For You', icon: '🎯' },
        { id: 'skillgap', label: '📊 Skill Gap', icon: '📊' },
        { id: 'chat', label: '💬 Chat', icon: '💬' },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar */}
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-blue-600">PlaceEase</h1>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <span className="text-sm text-gray-600">👤 {user?.name}</span>
                        <button
                            onClick={() => navigate('/student/profile')}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Profile
                        </button>
                        <button
                            onClick={logout}
                            className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-white p-1 rounded-lg shadow-sm overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'jobs' && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Available Jobs</h2>
                        {loading ? (
                            <p className="text-gray-500">Loading jobs...</p>
                        ) : jobs.length === 0 ? (
                            <p className="text-gray-500">No eligible jobs available right now.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {jobs.map((job) => (
                                    <div key={job.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                                        <h3 className="text-lg font-bold text-gray-800">{job.title}</h3>
                                        <p className="text-gray-600 font-medium">{job.companyName}</p>
                                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{job.description}</p>
                                        <div className="mt-3 space-y-1 text-sm">
                                            <p>💰 CTC: {job.ctcMin} - {job.ctcMax} LPA</p>
                                            <p>📅 Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
                                            <p>⭐ CGPA: {job.requiredCgpa}+</p>
                                            <p>🎓 Branches: {parseBranches(job.allowedBranches)}</p>
                                        </div>
                                        {job.alreadyApplied ? (
                                            <span className="inline-block mt-4 px-4 py-2 bg-green-100 text-green-800 rounded text-sm font-medium">
                                                ✅ Already Applied
                                            </span>
                                        ) : applyingJob === job.id ? (
                                            <div className="mt-4 space-y-2">
                                                <input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={(e) => setResume(e.target.files[0])}
                                                    className="block w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApply(job.id)}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                                    >
                                                        Submit
                                                    </button>
                                                    <button
                                                        onClick={() => { setApplyingJob(null); setResume(null); }}
                                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setApplyingJob(job.id)}
                                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                                            >
                                                Apply Now
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'applications' && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">My Applications</h2>
                        {applications.length === 0 ? (
                            <p className="text-gray-500">You haven't applied to any jobs yet.</p>
                        ) : (
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied At</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {applications.map((app) => (
                                            <tr key={app.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm text-gray-900">#{app.jobId}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'recommendations' && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">🎯 Recommended For You</h2>
                        <p className="text-gray-500 mb-6">Jobs matched to your profile based on CGPA, skills, and branch</p>
                        <RecommendedJobs />
                    </div>
                )}

                {activeTab === 'skillgap' && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">📊 Skill Gap Analysis</h2>
                        <p className="text-gray-500 mb-6">See which skills are in demand and which ones you should learn</p>
                        <SkillGapAnalysis />
                    </div>
                )}

                {activeTab === 'chat' && (
                    <div className="max-w-2xl mx-auto">
                        <ChatWindow />
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
