import { useDB } from '~/server/utils/db'

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

  const id = getRouterParam(event, 'id')

  try {
    const sensor = await db
      .prepare('SELECT sensors.* FROM sensors JOIN devices ON sensors.device_id = devices.id WHERE sensors.id = ? AND devices.user_id = ?')
      .bind(id, userId)
      .first()

    if (!sensor) {
      throw createError({
        statusCode: 404,
        message: 'Sensör bulunamadı',
      })
    }

    await db
      .prepare('DELETE FROM sensors WHERE id = ?')
      .bind(id)
      .run()

    return {
      success: true,
      message: 'Sensör silindi',
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Delete sensor error:', error)
    throw createError({
      statusCode: 500,
      message: 'Sensör silinirken hata oluştu',
    })
  }
})
