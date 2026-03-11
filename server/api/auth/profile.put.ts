export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const session = await useAuthSession(event)

  const userId = session.data.userId

  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'Oturum bulunamadi',
    })
  }

  const body = await readBody<{
    name?: string
    surname?: string
    username?: string
    phone?: string
    language?: string
    country?: string
    current_password?: string
    new_password?: string
  }>(event)

  // Şifre değiştirme talebi varsa doğrula
  if (body.new_password) {
    if (!body.current_password) {
      throw createError({ statusCode: 400, message: 'Mevcut şifre gerekli' })
    }
    const existing = await db
      .prepare('SELECT password_hash FROM users WHERE id = ?')
      .bind(userId)
      .first<{ password_hash: string }>()
    if (!existing || String(existing.password_hash) !== String(body.current_password)) {
      throw createError({ statusCode: 400, message: 'Mevcut şifre hatalı' })
    }
    if (body.new_password.length < 6) {
      throw createError({ statusCode: 400, message: 'Yeni şifre en az 6 karakter olmalı' })
    }
  }

  // username benzersizlik kontrolü
  if (body.username) {
    const taken = await db
      .prepare('SELECT id FROM users WHERE username = ? AND id != ?')
      .bind(body.username.trim(), userId)
      .first()
    if (taken) {
      throw createError({ statusCode: 409, message: 'Bu kullanıcı adı zaten kullanılıyor' })
    }
  }

  const now = new Date().toISOString()

  const current = await db
    .prepare('SELECT name, surname, username, phone, language, country FROM users WHERE id = ?')
    .bind(userId)
    .first<{ name: string | null, surname: string | null, username: string, phone: string | null, language: string | null, country: string | null }>()

  const newPasswordHash = body.new_password ? body.new_password : undefined

  if (newPasswordHash) {
    await db
      .prepare(`UPDATE users SET
        name = ?, surname = ?, username = ?, phone = ?, language = ?, country = ?,
        password_hash = ?, updated_at = ?
      WHERE id = ?`)
      .bind(
        body.name?.trim() ?? current?.name,
        body.surname?.trim() ?? current?.surname,
        body.username?.trim() ?? current?.username,
        body.phone?.trim() || null,
        body.language?.trim() || null,
        body.country?.trim() || null,
        newPasswordHash,
        now,
        userId,
      )
      .run()
  }
  else {
    await db
      .prepare(`UPDATE users SET
        name = ?, surname = ?, username = ?, phone = ?, language = ?, country = ?,
        updated_at = ?
      WHERE id = ?`)
      .bind(
        body.name?.trim() ?? current?.name,
        body.surname?.trim() ?? current?.surname,
        body.username?.trim() ?? current?.username,
        body.phone?.trim() || null,
        body.language?.trim() || null,
        body.country?.trim() || null,
        now,
        userId,
      )
      .run()
  }

  // Session'daki adı güncelle
  if (body.name || body.surname) {
    await session.update({
      ...session.data,
      name: body.name?.trim() ?? session.data.name,
      surname: body.surname?.trim() ?? session.data.surname,
    })
  }

  return {
    success: true,
    message: 'Profil güncellendi',
  }
})
