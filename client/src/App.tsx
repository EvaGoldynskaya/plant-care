import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AuthPage from './routes/auth';
import PlantsPage from './routes/plants';
import PlantAddPage from './routes/plants/add';
import authStore from './store/authStore';
import PlantDetailsPage from './routes/plants/[id]';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!authStore.isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  if (authStore.isAuthenticated) {
    return <Navigate to="/plants" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/plants" replace />} />
        <Route
          path="/auth"
          element={
            <GuestRoute>
              <AuthPage />
            </GuestRoute>
          }
        />
        <Route
          path="/plants"
          element={
            <ProtectedRoute>
              <PlantsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plants/:id"
          element={
            <ProtectedRoute>
              <PlantDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plants/add"
          element={
            <ProtectedRoute>
              <PlantAddPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/plants" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
