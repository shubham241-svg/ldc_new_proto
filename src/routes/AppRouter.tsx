import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useIsAuthenticated } from '@azure/msal-react';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { HomePage } from '@/pages/HomePage';
// import { TablePage } from '@/pages/TablePage';
import { DynamicTablePage } from '@/pages/NewTable';
import { sampleapiresponse } from '@/data/sampleData';

export function AppRouter() {
    const isAuthenticated = useIsAuthenticated();

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={
                        isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
                    }
                />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <HomePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/table"
                    element={
                        <ProtectedRoute>
                            {/* <TablePage /> */}
                            <DynamicTablePage records={sampleapiresponse.data} />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
