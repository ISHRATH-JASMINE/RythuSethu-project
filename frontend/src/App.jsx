import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import DealerDashboard from './pages/DealerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import CropAdvisor from './pages/CropAdvisor'
import StorageFinder from './pages/StorageFinder'
import Marketplace from './pages/Marketplace'
import ProductDetails from './pages/ProductDetails'
import AddProduct from './pages/AddProduct'
import Weather from './pages/Weather'
import Schemes from './pages/Schemes'
import AgentHub from './pages/AgentHub'
import Forum from './pages/Forum'
import ForumPost from './pages/ForumPost'
import Profile from './pages/Profile'
import PriceAnalytics from './pages/PriceAnalytics'
import { useAuth } from './context/AuthContext'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function RoleBasedRoute({ children, allowedRoles }) {
  const { user } = useAuth()
  
  if (!user) {
    return <Navigate to="/login" />
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />
  }
  
  return children
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Role-specific dashboards */}
        <Route path="/dealer-dashboard" element={
          <RoleBasedRoute allowedRoles={['dealer']}>
            <DealerDashboard />
          </RoleBasedRoute>
        } />
        <Route path="/admin-dashboard" element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </RoleBasedRoute>
        } />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="crop-advisor" element={<PrivateRoute><CropAdvisor /></PrivateRoute>} />
          <Route path="storage-finder" element={<PrivateRoute><StorageFinder /></PrivateRoute>} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="marketplace/:id" element={<ProductDetails />} />
          <Route path="marketplace/add" element={<PrivateRoute><AddProduct /></PrivateRoute>} />
          <Route path="weather" element={<PrivateRoute><Weather /></PrivateRoute>} />
          <Route path="schemes" element={<PrivateRoute><Schemes /></PrivateRoute>} />
          <Route path="agent-hub" element={<PrivateRoute><AgentHub /></PrivateRoute>} />
          <Route path="forum" element={<Forum />} />
          <Route path="forum/:id" element={<ForumPost />} />
          <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="price-analytics" element={<PrivateRoute><PriceAnalytics /></PrivateRoute>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
