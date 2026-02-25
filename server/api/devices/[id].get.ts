export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const config = useRuntimeConfig()
  const session = await useSession(event, {
    password: config.sessionSecret,
  })

  const userId = session.data.userId

  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'Oturum bulunamadı',
    })
  }

  const id = getRouterParam(event, 'id')

  try {
    const device = await db
      .prepare('SELECT * FROM devices WHERE id = ? AND user_id = ?')
      .bind(id, userId)
      .first()

    if (!device) {
      throw createError({
        statusCode: 404,
        message: 'Cihaz bulunamadı',
      })
    }

    return {
      success: true,
      device,
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Get device error:', error)
    throw createError({
      statusCode: 500,
      message: 'Cihaz alınırken hata oluştu',
    })
  }
})
