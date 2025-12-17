import db from '~/server/db/knex'

export default defineEventHandler(async (event) => {
  const { name, surname, email, password } = await readBody(event)

  if (!name || !surname || !email || !password) {
    throw createError({
      statusCode: 400,
      message: 'Tüm alanlar gerekli',
    })
  }

  // Email formatı kontrolü
  const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw createError({
      statusCode: 400,
      message: 'Geçerli bir email adresi girin',
    })
  }

  // Şifre uzunluğu kontrolü
  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      message: 'Şifre en az 6 karakter olmalı',
    })
  }

  try {
    // Email zaten kayıtlı mı kontrol et
    const existingUser = await db('users')
      .where({ email })
      .first()

    if (existingUser) {
      throw createError({
        statusCode: 409,
        message: 'Bu email adresi zaten kullanılıyor',
      })
    }

    // Yeni kullanıcı oluştur
    await db('users').insert({
      name,
      surname,
      email,
      password, // Production'da hash'lenmiş olmalı!
      created_at: new Date(),
    })

    // SQL Server'da IDENTITY değerini almak için
    const [newUser] = await db('users')
      .where({ email })
      .select('id')

    // Session'a kullanıcıyı kaydet
    const session = await useSession(event, {
      password: process.env.SESSION_SECRET || 'REDACTED_SECRET',
    })

    await session.update({
      userId: newUser.id,
      email,
      name,
      surname,
    })

    return {
      success: true,
      user: {
        id: newUser.id,
        name,
        surname,
        email,
      },
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Register error:', error)
    throw createError({
      statusCode: 500,
      message: 'Kayıt olunurken bir hata oluştu',
    })
  }
})
