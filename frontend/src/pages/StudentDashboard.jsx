import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('jobs');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchJobs();
        fetchApplications();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await API.get('/student/jobs');
            setJobs(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch jobs');
            setLoading(false);
        }
    };

    const fetchApplications = async () => {
        try {
            const response = await API.get('/student/applications');
            setApplications(response.data);
        } catch (err) {
            console.error('Failed to fetch applications');
        }
    };

    const handleApply = async (jobId) => {
        try {
            await API.post(`/student/apply/${jobId}`);
            setSuccess('Application submitted successfully!');
            setTimeout(() => setSuccess(''), 3000);
            fetchJobs();
            fetchApplications();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to apply');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const parseBranches = (branchesJson) => {
        try {
            return JSON.parse(branchesJson).join(', ');
        } catch {
            return branchesJson;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-primary">PlaceEase</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-700">Welcome, {user?.name}</span>
                        <span className="text-sm text-gray-500">({user?.branch} - CGPA: {user?.cgpa})</span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-6 flex gap-4">
                    <button
                        onClick={() => setActiveTab('jobs')}
                        className={`px-6 py-2 rounded-lg font-semibold ${activeTab === 'jobs'
                                ? 'bg-primary text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Available Jobs ({jobs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`px-6 py-2 rounded-lg font-semibold ${activeTab === 'applications'
                                ? 'bg-primary text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        My Applications ({applications.length})
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {success}
                    </div>
                )}

                {activeTab === 'jobs' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            <p>Loading jobs...</p>
                        ) : jobs.length === 0 ? (
                            <p className="col-span-3 text-center text-gray-500">No eligible jobs available</p>
                        ) : (
                            jobs.map((job) => (
                                <div key={job.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{job.title}</h3>
                                    <p className="text-gray-600 mb-1">{job.companyName}</p>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{job.description}</p>

                                    <div className="space-y-2 text-sm mb-4">
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

                                    <button
                                        onClick={() => handleApply(job.id)}
                                        disabled={job.alreadyApplied}
                                        className={`w-full py-2 px-4 rounded font-semibold ${job.alreadyApplied
                                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                                : 'bg-primary text-white hover:bg-blue-700'
                                            }`}
                                    >
                                        {job.alreadyApplied ? 'Already Applied' : 'Apply Now'}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'applications' && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        {applications.length === 0 ? (
                            <p className="text-center text-gray-500">No applications yet</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="px-4 py-2 text-left">Job ID</th>
                                            <th className="px-4 py-2 text-left">Status</th>
                                            <th className="px-4 py-2 text-left">Applied Date</th>
                                            <th className="px-4 py-2 text-left">Last Updated</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.map((app) => (
                                            <tr key={app.id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-2">{app.jobId}</td>
                                                <td className="px-4 py-2">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${app.status === 'APPLIED'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : app.status === 'SHORTLISTED'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : app.status === 'REJECTED'
                                                                        ? 'bg-red-100 text-red-800'
                                                                        : app.status === 'OFFERED'
                                                                            ? 'bg-purple-100 text-purple-800'
                                                                            : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                    >
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2">
                                                    {new Date(app.appliedDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {new Date(app.updatedDate).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
