import create from 'zustand'
import api from '../services/api'

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  isUsingMock: api.isUsingMock(),

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const response = await api.login(email, password)
      const { token, user } = response

      localStorage.setItem('token', token)

      set({
        user,
        token,
        isAuthenticated: true,
        loading: false
      })
      return true
    } catch (error) {
      const message = error.error || error.message || 'Login failed'
      set({ error: message, loading: false })
      return false
    }
  },

  register: async (email, password, fullName) => {
    set({ loading: true, error: null })
    try {
      await api.register(email, password, fullName)
      set({ loading: false })
      return true
    } catch (error) {
      const message = error.error || error.message || 'Registration failed'
      set({ error: message, loading: false })
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('token')
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
      const user = await api.getMe()
      set({
        user,
        isAuthenticated: true,
        token
      })
    } catch (error) {
      localStorage.removeItem('token')
      set({
        user: null,
        token: null,
        isAuthenticated: false
      })
    }
  },

  setMockMode: (use) => {
    api.setMockMode(use)
  }
}))
