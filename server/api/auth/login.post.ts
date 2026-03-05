import type { User } from '~/types'

export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const { email, password } = await readBody(event)

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: 'Email ve şifre gerekli',
    })
  }

  try {
    // Kullanıcıyı veritabanından bul
    const user = await db
      .prepare('SELECT * FROM users WHERE mail = ?')
      .bind(email)
      .first<User>()

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Geçersiz email veya şifre',
      })
    }

    // Şifre kontrolü
    if (user.password_hash !== password) {
      throw createError({
        statusCode: 401,
        message: 'Geçersiz email veya şifre',
      })
    }

    // Session'a kullanıcıyı kaydet
    const session = await useAuthSession(event)

    await session.update({
      userId: user.id,
      email: user.mail,
      name: user.name,
      surname: user.surname,
    })

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.mail,
      },
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Login error:', error)
    throw createError({
      statusCode: 500,
      message: 'Giriş yapılırken bir hata oluştu',
    })
  }
})
