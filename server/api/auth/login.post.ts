import type { User } from '~/types'
import db from '~/server/db/knex'

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: 'Email ve şifre gerekli',
    })
  }

  try {
    // Kullanıcıyı veritabanından bul
    const user: User = await db('users')
      .where({ email })
      .first()

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Geçersiz email veya şifre',
      })
    }

    // Şifre kontrolü (plain text - production'da hash kullanın!)
    if (user.password !== password) {
      throw createError({
        statusCode: 401,
        message: 'Geçersiz email veya şifre',
      })
    }

    // Session'a kullanıcıyı kaydet
    const config = useRuntimeConfig()
    const session = await useSession(event, {
      password: config.sessionSecret,
    })

    await session.update({
      userId: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
    })

    return {
      success: true,
      user,
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
