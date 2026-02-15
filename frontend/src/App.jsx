import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/login" />;
    }

    return children;
};

function AppRoutes() {
    const { user } = useAuth();

    return (
        <Routes>
            <Route
                path="/"
                element={
                    user ? (
                        user.role === 'STUDENT' ? (
                            <Navigate to="/student/dashboard" />
                        ) : user.role === 'RECRUITER' ? (
                            <Navigate to="/recruiter/dashboard" />
                        ) : (
                            <Navigate to="/admin/dashboard" />
                        )
                    ) : (
                        <Navigate to="/login" />
                    )
                }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
                path="/student/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                        <StudentDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/recruiter/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['RECRUITER']}>
                        <RecruiterDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}

export default App;
