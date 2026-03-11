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

  const register = async (data: { name: string, surname: string, username: string, email: string, password: string, phone?: string }) => {
    try {
      const response = await $fetch('/api/auth/register', {
        method: 'POST',
        body: data,
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
      const headers = useRequestHeaders(['cookie'])
      const response = await $fetch('/api/auth/me', { headers })
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
