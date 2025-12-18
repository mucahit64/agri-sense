import db from '~/server/db/knex'

export default defineEventHandler(async (event) => {
  const session = await useSession(event, {
    password: process.env.SESSION_SECRET!,
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
    const device = await db('devices')
      .where({ id, user_id: userId })
      .first()

    if (!device) {
      throw createError({
        statusCode: 404,
        message: 'Cihaz bulunamadı',
      })
    }

    await db('devices').where({ id }).delete()

    return {
      success: true,
      message: 'Cihaz silindi',
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Delete device error:', error)
    throw createError({
      statusCode: 500,
      message: 'Cihaz silinirken hata oluştu',
    })
  }
})
