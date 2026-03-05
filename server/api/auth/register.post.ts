export default defineEventHandler(async (event) => {
  const db = useDB(event)
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
    const existingUser = await db
      .prepare('SELECT id FROM users WHERE email = ?')
      .bind(email)
      .first()

    if (existingUser) {
      throw createError({
        statusCode: 409,
        message: 'Bu email adresi zaten kullanılıyor',
      })
    }

    // Yeni kullanıcı oluştur
    const result = await db
      .prepare('INSERT INTO users (name, surname, email, password, created_at) VALUES (?, ?, ?, ?, ?) RETURNING id')
      .bind(name, surname, email, password, new Date().toISOString())
      .first<{ id: number }>()

    const newUserId = result?.id

    // Session'a kullanıcıyı kaydet
    const session = await useAuthSession(event)

    await session.update({
      userId: newUserId,
      email,
      name,
      surname,
    })

    return {
      success: true,
      user: {
        id: newUserId,
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
