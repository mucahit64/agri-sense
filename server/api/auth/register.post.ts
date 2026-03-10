export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const { name, surname, username, email, password, phone } = await readBody(event)

  if (!name || !surname || !username || !email || !password) {
    throw createError({
      statusCode: 400,
      message: 'Ad, soyad, kullanıcı adı, email ve şifre gerekli',
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
      .prepare('SELECT id FROM users WHERE mail = ?')
      .bind(email)
      .first()

    if (existingUser) {
      throw createError({
        statusCode: 409,
        message: 'Bu email adresi zaten kullanılıyor',
      })
    }

    // Username zaten kayıtlı mı kontrol et
    const existingUsername = await db
      .prepare('SELECT id FROM users WHERE username = ?')
      .bind(username)
      .first()

    if (existingUsername) {
      throw createError({
        statusCode: 409,
        message: 'Bu kullanıcı adı zaten kullanılıyor',
      })
    }

    const now = new Date().toISOString()

    // Yeni kullanıcı oluştur
    const result = await db
      .prepare('INSERT INTO users (name, surname, username, mail, password_hash, phone, language, country, is_active, last_login_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?) RETURNING id')
      .bind(name, surname, username, email, password, phone || null, null, null, now, now)
      .first() as { id: number } | null

    const newUserId = result?.id

    // Session'a kullanıcıyı kaydet
    const session = await useAuthSession(event)

    await session.update({
      userId: newUserId,
      email,
      name,
      surname,
      username,
    })

    return {
      success: true,
      user: {
        id: newUserId,
        name,
        surname,
        username,
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
