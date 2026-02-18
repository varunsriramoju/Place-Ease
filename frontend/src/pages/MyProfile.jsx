import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const MyProfile = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        cgpa: '',
        skills: [],
        resumeUrl: '',
        newPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [skillInput, setSkillInput] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await API.get('/user/profile');
            const userData = response.data;
            setFormData({
                name: userData.name || '',
                phone: userData.phone || '',
                cgpa: userData.cgpa || '',
                skills: userData.skills || [],
                resumeUrl: userData.resumeUrl || '',
                newPassword: ''
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                name: formData.name,
                phone: formData.phone
            };

            // Add student-specific fields
            if (user.role === 'STUDENT') {
                payload.cgpa = parseFloat(formData.cgpa);
                payload.skills = formData.skills;
                payload.resumeUrl = formData.resumeUrl;
            }

            // Add password only if changed
            if (formData.newPassword) {
                payload.newPassword = formData.newPassword;
            }

            await API.put('/user/profile', payload);
            alert('Profile updated successfully!');

            // Clear password field
            setFormData({ ...formData, newPassword: '' });
        } catch (error) {
            alert('Failed to update profile: ' + error.response?.data?.error);
        } finally {
            setLoading(false);
        }
    };

    const addSkill = () => {
        if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
            setFormData({
                ...formData,
                skills: [...formData.skills, skillInput.trim()]
            });
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter(s => s !== skillToRemove)
        });
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">My Profile</h2>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                </div>

                {/* Email (Read-only) */}
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium mb-1">Phone Number *</label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        pattern="[0-9]{10}"
                        placeholder="9876543210"
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                </div>

                {/* Role (Read-only) */}
                <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <input
                        type="text"
                        value={user.role}
                        disabled
                        className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                    />
                </div>

                {/* Student-specific fields */}
                {user.role === 'STUDENT' && (
                    <>
                        {/* Branch (Read-only) */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Branch</label>
                            <input
                                type="text"
                                value={user.branch}
                                disabled
                                className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">Branch cannot be changed</p>
                        </div>

                        {/* CGPA */}
                        <div>
                            <label className="block text-sm font-medium mb-1">CGPA *</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="10"
                                value={formData.cgpa}
                                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                                required
                            />
                        </div>

                        {/* Skills */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Skills</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                    placeholder="e.g., Java, React"
                                    className="flex-1 border rounded px-3 py-2"
                                />
                                <button
                                    type="button"
                                    onClick={addSkill}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.skills.map((skill, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-gray-200 rounded-full text-sm flex items-center gap-2"
                                    >
                                        {skill}
                                        <button
                                            type="button"
                                            onClick={() => removeSkill(skill)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Resume URL */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Resume URL</label>
                            <input
                                type="url"
                                value={formData.resumeUrl}
                                onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                                placeholder="https://example.com/resume.pdf"
                                className="w-full border rounded px-3 py-2"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Upload your resume to Google Drive/Dropbox and paste the link here
                            </p>
                        </div>
                    </>
                )}

                {/* Change Password (Optional) */}
                <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold mb-2">Change Password (Optional)</h3>
                    <div>
                        <label className="block text-sm font-medium mb-1">New Password</label>
                        <input
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            placeholder="Leave blank to keep current password"
                            minLength="8"
                            className="w-full border rounded px-3 py-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Minimum 8 characters. Leave blank if you don't want to change password.
                        </p>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? 'Updating...' : 'Update Profile'}
                </button>
            </form>
        </div>
    );
};

export default MyProfile;
