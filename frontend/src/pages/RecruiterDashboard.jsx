import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const RecruiterDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [activeTab, setActiveTab] = useState('jobs');
    const [showJobForm, setShowJobForm] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        companyName: '',
        requiredCgpa: '',
        allowedBranches: [],
        ctcMin: '',
        ctcMax: '',
        deadline: '',
        numOpenings: 1,
        selectionProcess: ''
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await API.get('/recruiter/jobs');
            setJobs(response.data);
        } catch (err) {
            setError('Failed to fetch jobs');
        }
    };

    const fetchApplications = async (jobId) => {
        try {
            const response = await API.get(`/recruiter/jobs/${jobId}/applications`);
            setApplications(response.data);
            setSelectedJob(jobId);
            setActiveTab('applications');
        } catch (err) {
            setError('Failed to fetch applications');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleBranchChange = (e) => {
        const options = e.target.options;
        const selected = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selected.push(options[i].value);
            }
        }
        setFormData({ ...formData, allowedBranches: selected });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                requiredCgpa: parseFloat(formData.requiredCgpa),
                ctcMin: parseFloat(formData.ctcMin),
                ctcMax: parseFloat(formData.ctcMax),
                numOpenings: parseInt(formData.numOpenings),
                allowedBranches: JSON.stringify(formData.allowedBranches)
            };

            await API.post('/recruiter/jobs', submitData);
            setSuccess('Job posted successfully! Waiting for admin approval.');
            setTimeout(() => setSuccess(''), 3000);
            setShowJobForm(false);
            fetchJobs();
            setFormData({
                title: '',
                description: '',
                companyName: '',
                requiredCgpa: '',
                allowedBranches: [],
                ctcMin: '',
                ctcMax: '',
                deadline: '',
                numOpenings: 1,
                selectionProcess: ''
            });
        } catch (err) {
            console.error("Job posting error:", err);
            const errorMessage = err.response?.data?.error || 'Failed to post job. Please check your inputs.';
            setError(errorMessage);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const updateApplicationStatus = async (applicationId, status) => {
        try {
            await API.put(`/recruiter/applications/${applicationId}/status`, { status });
            setSuccess('Application status updated');
            fetchApplications(selectedJob);
        } catch (err) {
            console.error("Status update error:", err);
            setError(err.response?.data?.error || 'Failed to update status');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-primary">PlaceEase - Recruiter</h1>
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
                <div className="mb-6 flex gap-4 items-center">
                    <button
                        onClick={() => setActiveTab('jobs')}
                        className={`px-6 py-2 rounded-lg font-semibold ${activeTab === 'jobs'
                            ? 'bg-primary text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        My Jobs ({jobs.length})
                    </button>
                    {activeTab === 'applications' && (
                        <button
                            onClick={() => setActiveTab('jobs')}
                            className="text-primary hover:underline"
                        >
                            ← Back to Jobs
                        </button>
                    )}
                    {activeTab === 'jobs' && (
                        <button
                            onClick={() => setShowJobForm(!showJobForm)}
                            className="ml-auto bg-success text-white px-6 py-2 rounded-lg hover:bg-green-600"
                        >
                            {showJobForm ? 'Cancel' : '+ Post New Job'}
                        </button>
                    )}
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

                {showJobForm && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-2xl font-bold mb-4">Post New Job</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Job Title *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Company Name *</label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded"
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold mb-1">Description *</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded"
                                        rows="3"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Required CGPA *</label>
                                    <input
                                        type="number"
                                        name="requiredCgpa"
                                        value={formData.requiredCgpa}
                                        onChange={handleChange}
                                        step="0.01"
                                        min="0"
                                        max="10"
                                        className="w-full px-3 py-2 border rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Allowed Branches * (Hold Ctrl to select multiple)</label>
                                    <select
                                        multiple
                                        onChange={handleBranchChange}
                                        className="w-full px-3 py-2 border rounded"
                                        required
                                        size="6"
                                    >
                                        <option value="CS">Computer Science</option>
                                        <option value="IT">Information Technology</option>
                                        <option value="ECE">Electronics & Communication</option>
                                        <option value="EEE">Electrical & Electronics</option>
                                        <option value="MECH">Mechanical</option>
                                        <option value="CIVIL">Civil</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">CTC Min (LPA) *</label>
                                    <input
                                        type="number"
                                        name="ctcMin"
                                        value={formData.ctcMin}
                                        onChange={handleChange}
                                        step="0.01"
                                        className="w-full px-3 py-2 border rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">CTC Max (LPA) *</label>
                                    <input
                                        type="number"
                                        name="ctcMax"
                                        value={formData.ctcMax}
                                        onChange={handleChange}
                                        step="0.01"
                                        className="w-full px-3 py-2 border rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Deadline *</label>
                                    <input
                                        type="date"
                                        name="deadline"
                                        value={formData.deadline}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Number of Openings *</label>
                                    <input
                                        type="number"
                                        name="numOpenings"
                                        value={formData.numOpenings}
                                        onChange={handleChange}
                                        min="1"
                                        className="w-full px-3 py-2 border rounded"
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold mb-1">Selection Process</label>
                                    <textarea
                                        name="selectionProcess"
                                        value={formData.selectionProcess}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded"
                                        rows="2"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="mt-4 bg-primary text-white px-6 py-2 rounded hover:bg-blue-700"
                            >
                                Post Job
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'jobs' && (
                    <div className="grid grid-cols-1 gap-4">
                        {jobs.length === 0 ? (
                            <p className="text-center text-gray-500">No jobs posted yet</p>
                        ) : (
                            jobs.map((job) => (
                                <div key={job.id} className="bg-white rounded-lg shadow-md p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold">{job.title}</h3>
                                            <p className="text-gray-600">{job.companyName}</p>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${job.status === 'APPROVED'
                                                ? 'bg-green-100 text-green-800'
                                                : job.status === 'PENDING'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {job.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">{job.description}</p>
                                    <div className="mt-4 flex gap-4 text-sm">
                                        <span>CGPA: {job.requiredCgpa}+</span>
                                        <span>CTC: {job.ctcMin}-{job.ctcMax} LPA</span>
                                        <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                                    </div>
                                    {job.status === 'APPROVED' && (
                                        <button
                                            onClick={() => fetchApplications(job.id)}
                                            className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-blue-700"
                                        >
                                            View Applications
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'applications' && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold mb-4">Applications</h2>
                        {applications.length === 0 ? (
                            <p className="text-center text-gray-500">No applications yet</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="px-4 py-2 text-left">Student ID</th>
                                            <th className="px-4 py-2 text-left">Status</th>
                                            <th className="px-4 py-2 text-left">Applied Date</th>
                                            <th className="px-4 py-2 text-left">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.map((app) => (
                                            <tr key={app.id} className="border-b">
                                                <td className="px-4 py-2">{app.studentId}</td>
                                                <td className="px-4 py-2">{app.status}</td>
                                                <td className="px-4 py-2">
                                                    {new Date(app.appliedDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <select
                                                        value={app.status}
                                                        onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                                                        className="px-2 py-1 border rounded text-sm"
                                                    >
                                                        <option value="APPLIED">Applied</option>
                                                        <option value="SHORTLISTED">Shortlisted</option>
                                                        <option value="REJECTED">Rejected</option>
                                                        <option value="OFFERED">Offered</option>
                                                        <option value="JOINED">Joined</option>
                                                    </select>
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

export default RecruiterDashboard;
