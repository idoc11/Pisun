import create from 'zustand'
import axios from 'axios'

const API_URL = '/api'

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password })
      const { token, user } = response.data

      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      set({
        user,
        token,
        isAuthenticated: true,
        loading: false
      })
      return true
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed'
      set({ error: message, loading: false })
      return false
    }
  },

  register: async (email, password, fullName) => {
    set({ loading: true, error: null })
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        full_name: fullName
      })
      set({ loading: false })
      return true
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed'
      set({ error: message, loading: false })
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    set({
      user: null,
      token: null,
      isAuthenticated: false
    })
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const response = await axios.get(`${API_URL}/auth/me`)
      set({
        user: response.data,
        isAuthenticated: true,
        token
      })
    } catch (error) {
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
      set({
        user: null,
        token: null,
        isAuthenticated: false
      })
    }
  }
}))
