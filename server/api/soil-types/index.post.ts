export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const session = await useAuthSession(event)
  const userId = session.data.userId

  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'Oturum bulunamadı',
    })
  }

  const body = await readBody<{ name: string }>(event)

  if (!body.name || !body.name.trim()) {
    throw createError({
      statusCode: 400,
      message: 'Toprak tipi adı gerekli',
    })
  }

  const name = body.name.trim()

  try {
    // Aynı isimde kayıt var mı kontrol et
    const existing = await db
      .prepare('SELECT id, is_system, is_approved FROM soil_types WHERE name = ?')
      .bind(name)
      .first()

    if (existing) {
      throw createError({
        statusCode: 409,
        message: 'Bu toprak tipi zaten mevcut, listeden seçebilirsiniz',
      })
    }

    const soilType = await db
      .prepare(
        `INSERT INTO soil_types (name, created_by, is_system, is_approved, is_active)
         VALUES (?, ?, 0, 0, 1) RETURNING *`,
      )
      .bind(name, userId)
      .first()

    return {
      success: true,
      soilType,
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Create soil type error:', error)
    throw createError({
      statusCode: 500,
      message: 'Toprak tipi oluşturulurken hata oluştu',
    })
  }
})
