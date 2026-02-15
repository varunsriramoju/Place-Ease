import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [pendingJobs, setPendingJobs] = useState([]);
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchPendingJobs();
        fetchStats();
    }, []);

    const fetchPendingJobs = async () => {
        try {
            const response = await API.get('/admin/jobs/pending');
            setPendingJobs(response.data);
        } catch (err) {
            setError('Failed to fetch pending jobs');
        }
    };

    const fetchStats = async () => {
        try {
            const response = await API.get('/admin/dashboard');
            setStats(response.data);
        } catch (err) {
            setError('Failed to fetch statistics');
        }
    };

    const handleApproval = async (jobId, approved) => {
        try {
            await API.put(`/admin/jobs/${jobId}/approve`, { approved });
            setSuccess(`Job ${approved ? 'approved' : 'rejected'} successfully`);
            setTimeout(() => setSuccess(''), 3000);
            fetchPendingJobs();
            fetchStats();
        } catch (err) {
            console.error("Approval error:", err);
            setError(err.response?.data?.error || 'Failed to update job status');
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
                    <h1 className="text-2xl font-bold text-primary">PlaceEase - Admin</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-700">Welcome, {user?.name}</span>
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
                        onClick={() => setActiveTab('pending')}
                        className={`px-6 py-2 rounded-lg font-semibold ${activeTab === 'pending'
                            ? 'bg-primary text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Pending Jobs ({pendingJobs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`px-6 py-2 rounded-lg font-semibold ${activeTab === 'dashboard'
                            ? 'bg-primary text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Dashboard
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

                {activeTab === 'pending' && (
                    <div className="space-y-4">
                        {pendingJobs.length === 0 ? (
                            <p className="text-center text-gray-500">No pending jobs</p>
                        ) : (
                            pendingJobs.map((job) => (
                                <div key={job.id} className="bg-white rounded-lg shadow-md p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold">{job.title}</h3>
                                            <p className="text-gray-600">{job.companyName}</p>
                                        </div>
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                            {job.status}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-700 mb-4">{job.description}</p>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                                        <div>
                                            <span className="font-semibold">Required CGPA:</span> {job.requiredCgpa}
                                        </div>
                                        <div>
                                            <span className="font-semibold">CTC:</span> {job.ctcMin}-{job.ctcMax} LPA
                                        </div>
                                        <div>
                                            <span className="font-semibold">Openings:</span> {job.numOpenings}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Deadline:</span>{' '}
                                            {new Date(job.deadline).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <span className="font-semibold text-sm">Allowed Branches:</span>{' '}
                                        <span className="text-sm">{parseBranches(job.allowedBranches)}</span>
                                    </div>

                                    {job.eligibleStudents && (
                                        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
                                            <h4 className="font-semibold text-blue-900 mb-2">
                                                Eligible Students: {job.eligibleStudents.total}
                                            </h4>
                                            <div className="flex flex-wrap gap-3 text-sm">
                                                {Object.entries(job.eligibleStudents.breakdown).map(([branch, count]) => (
                                                    <span key={branch} className="bg-blue-100 px-3 py-1 rounded">
                                                        {branch}: {count}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleApproval(job.id, true)}
                                            className="bg-success text-white px-6 py-2 rounded hover:bg-green-600"
                                        >
                                            ✓ Approve
                                        </button>
                                        <button
                                            onClick={() => handleApproval(job.id, false)}
                                            className="bg-error text-white px-6 py-2 rounded hover:bg-red-600"
                                        >
                                            ✗ Reject
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'dashboard' && stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Students</h3>
                            <p className="text-4xl font-bold text-primary">{stats.totalStudents}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Recruiters</h3>
                            <p className="text-4xl font-bold text-primary">{stats.totalRecruiters}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Jobs</h3>
                            <p className="text-4xl font-bold text-primary">{stats.totalJobs}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-gray-600 text-sm font-semibold mb-2">Approved Jobs</h3>
                            <p className="text-4xl font-bold text-success">{stats.approvedJobs}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-gray-600 text-sm font-semibold mb-2">Pending Jobs</h3>
                            <p className="text-4xl font-bold text-warning">{stats.pendingJobs}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
