import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext'; // Thêm dòng này

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* Bọc NotificationProvider ở đây để useNotification hoạt động ở mọi nơi */}
        <NotificationProvider>
            <AuthProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </AuthProvider>
        </NotificationProvider>
    </React.StrictMode>
);
