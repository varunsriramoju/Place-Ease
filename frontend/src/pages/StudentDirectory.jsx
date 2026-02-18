import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const StudentDirectory = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [filters, setFilters] = useState({
        branch: '',
        minCgpa: '',
        maxCgpa: '',
        sortBy: 'cgpa'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchStudents = async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (filters.branch) params.append('branch', filters.branch);
            if (filters.minCgpa) params.append('minCgpa', filters.minCgpa);
            if (filters.maxCgpa) params.append('maxCgpa', filters.maxCgpa);
            if (filters.sortBy) params.append('sortBy', filters.sortBy);

            const endpoint = user.role === 'ADMIN' ? '/admin/students' : '/recruiter/students';
            const response = await API.get(`${endpoint}?${params.toString()}`);
            setStudents(response.data.students);
        } catch (error) {
            console.error('Error fetching students:', error);
            setError('Failed to fetch students: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [filters]);

    const handleDeleteStudent = async (studentId, studentName) => {
        if (user.role !== 'ADMIN') return;

        const confirmed = window.confirm(
            `Are you sure you want to delete ${studentName}? This action cannot be undone and will also delete all their applications.`
        );

        if (!confirmed) return;

        try {
            await API.delete(`/admin/students/${studentId}`);
            alert('Student deleted successfully');
            fetchStudents(); // Refresh the list
        } catch (error) {
            alert('Failed to delete student: ' + (error.response?.data?.error || 'Unknown error'));
        }
    };

    const handleClearFilters = () => {
        setFilters({ branch: '', minCgpa: '', maxCgpa: '', sortBy: 'cgpa' });
    };

    return (
        <div className="p-6 min-h-screen bg-gray-50">
            <h2 className="text-2xl font-bold mb-4 text-primary">Student Directory</h2>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Branch</label>
                        <select
                            value={filters.branch}
                            onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="">All Branches</option>
                            <option value="CS">Computer Science</option>
                            <option value="IT">Information Technology</option>
                            <option value="ECE">Electronics</option>
                            <option value="EEE">Electrical</option>
                            <option value="MECH">Mechanical</option>
                            <option value="CIVIL">Civil</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Min CGPA</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            value={filters.minCgpa}
                            onChange={(e) => setFilters({ ...filters, minCgpa: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                            placeholder="0.0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Max CGPA</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            value={filters.maxCgpa}
                            onChange={(e) => setFilters({ ...filters, maxCgpa: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                            placeholder="10.0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Sort By</label>
                        <select
                            value={filters.sortBy}
                            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="cgpa">CGPA (High to Low)</option>
                            <option value="name">Name (A-Z)</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleClearFilters}
                        className="text-blue-600 text-sm hover:underline"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Student Table */}
            {loading ? (
                <div className="text-center py-8">Loading students...</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CGPA</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resume</th>
                                {user.role === 'ADMIN' && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan={user.role === 'ADMIN' ? 8 : 7} className="px-6 py-4 text-center text-gray-500">
                                        No students found matching the filters
                                    </td>
                                </tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{student.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{student.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                                                {student.branch}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-700">{student.cgpa}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{student.phone}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {student.skills?.slice(0, 3).map((skill, idx) => (
                                                    <span key={idx} className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {student.skills?.length > 3 && (
                                                    <span className="text-xs text-gray-500">+{student.skills.length - 3} more</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {student.resumeUrl ? (
                                                <a
                                                    href={student.resumeUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline text-sm"
                                                >
                                                    View
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 text-sm">N/A</span>
                                            )}
                                        </td>
                                        {user.role === 'ADMIN' && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleDeleteStudent(student.id, student.name)}
                                                    className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            <div className="mt-4 text-sm text-gray-600 text-right">
                Showing {students.length} student{students.length !== 1 ? 's' : ''}
            </div>
        </div>
    );
};

export default StudentDirectory;
