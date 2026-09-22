import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Materials from './pages/Materials'
import Suppliers from './pages/Suppliers'
import Orders from './pages/Orders'
import Procurement from './pages/Procurement'
import Warehouse from './pages/Warehouse'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Navigation from './components/Navigation'
import './App.css'

function App() {
  const { isAuthenticated, user, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <Router>
      {!isAuthenticated ? (
        <Login />
      ) : (
        <div className="app-container">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/materials" element={<Materials />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/procurement" element={<Procurement />} />
              <Route path="/warehouse" element={<Warehouse />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      )}
    </Router>
  )
}

export default App
