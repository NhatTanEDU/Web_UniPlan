import React from 'react';
import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
import AppRoutes from './router';
import { AuthProvider } from "./components/context/AuthContext";
import { NetworkProvider } from "./components/context/NetworkContext";
import { ToastProvider } from './components/context/ToastContext';

const AppContent: React.FC = () => {
    const navigate = useNavigate();

    return (
        <AuthProvider navigate={navigate}>
            <NetworkProvider navigate={navigate}>
                <ToastProvider>
                    <AppRoutes />
                </ToastProvider>
            </NetworkProvider>
        </AuthProvider>
    );
};

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
