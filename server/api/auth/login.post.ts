import type { User } from '~/types'

export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const { identifier, password } = await readBody(event)

  if (!identifier || !password) {
    throw createError({
      statusCode: 400,
      message: 'E-posta/kullanıcı adı ve şifre gerekli',
    })
  }

  try {
    // Kullanıcıyı e-posta veya kullanıcı adı ile bul
    const user = await db
      .prepare('SELECT * FROM users WHERE mail = ? OR username = ?')
      .bind(identifier, identifier)
      .first() as User | null

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Geçersiz e-posta/kullanıcı adı veya şifre',
      })
    }

    // Şifre kontrolü
    if (String(user.password_hash) !== String(password)) {
      throw createError({
        statusCode: 401,
        message: 'Geçersiz e-posta/kullanıcı adı veya şifre',
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
