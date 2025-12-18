export function useAuth() {
  const user = useState<any>('user', () => null)

  const login = async (email: string, password: string) => {
    try {
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })

      user.value = response.user
      return { success: true }
    }
    catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Giriş yapılırken bir hata oluştu',
      }
    }
  }

  const register = async (name: string, surname: string, email: string, password: string) => {
    try {
      const response = await $fetch('/api/auth/register', {
        method: 'POST',
        body: { name, surname, email, password },
      })

      user.value = response.user
      return { success: true }
    }
    catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Kayıt olunurken bir hata oluştu',
      }
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST',
      })
      user.value = null
      return { success: true }
    }
    catch (error) {
      console.error('Logout error:', error)
      return { success: false }
    }
  }

  const checkAuth = async () => {
    try {
      const response = await $fetch('/api/auth/me')
      user.value = response.user
      return true
    }
    catch {
      user.value = null
      return false
    }
  }

  return {
    user,
    login,
    register,
    logout,
    checkAuth,
  }
}
