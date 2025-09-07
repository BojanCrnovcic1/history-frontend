import { Route, Routes, useNavigate } from 'react-router-dom'
import LandingPage from './pages/landing/LandingPage'
import Map from './pages/map/Map'
import Login from './pages/login/Login'
import ResetPassword from './components/resetPassword/ResetPassword'
import Register from './pages/register/Register'
import Subscription from './components/subscription/Subscription'
import { useAuth } from './context/AuthContext'
import { useEffect } from 'react'
import ProtectedRoute from './misc/ProtectedRoute'
import AdminDashbourd from './pages/admin/AdminDashbourd'
import CreateLocation from './components/admin/createLocation/CreateLocation'
import ManageLocations from './components/admin/manageLocations/ManageLocations'
import CreateTimePeriod from './components/admin/createTimePeriod/CreateTimePeriod'
import ManageTimePeriod from './components/admin/manageTimePeriod/ManageTimePeroid'
import CreateEvent from './components/admin/createEvent/CreateEvent'
import ManageEvents from './components/admin/manageEvents/ManageEvents'
import ManageUsers from './components/admin/manageUsers/ManageUsers'
import VisitTrucker from './misc/VisitTrucker'
import VisitStates from './components/admin/visitStates/VisitStates'


const App = () => {
  const { accessToken, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
 
    VisitTrucker();

    if (user?.role) {
      if (
        accessToken &&
        user.role === 'ADMIN' &&
        !window.location.pathname.startsWith('/adminPanel')
      ) {
        navigate('/adminPanel');
      }
    }
  }, [accessToken, user?.role, navigate]);

  return (
    <Routes>
      <Route path='/' element={<LandingPage />} />
      <Route path='/map' element={<Map />} />

      <Route path='/subscription' element={<Subscription />} />

      <Route
        path='/adminPanel/'
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashbourd />
          </ProtectedRoute>
        }
      >
        <Route path='createEvents' element={<CreateEvent />} />
        <Route path='manageEvents' element={<ManageEvents />} />
        <Route path='createTimePeriod' element={<CreateTimePeriod />} />
        <Route path='manageTimePeriod' element={<ManageTimePeriod />} />
        <Route path='createLocation' element={<CreateLocation />} />
        <Route path='manageLocations' element={<ManageLocations />} />
        <Route path='manageUsers' element={<ManageUsers />} />
        <Route path='showVisits' element={<VisitStates />} />
      </Route>

      <Route path='/login' element={<Login />} />
      <Route path='/reset-password' element={<ResetPassword />} />
      <Route path='/register' element={<Register />} />
    </Routes>
  );
};

export default App;
