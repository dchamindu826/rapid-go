import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        // If the user is not logged in, redirect them to the login page
        return <Navigate to="/login" />;
    }

    // If the user is logged in, show the page they were trying to access
    return children;
};

export default ProtectedRoute;