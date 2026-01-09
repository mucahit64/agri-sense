import db from '~/server/db/knex'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ id: number, date: string }>(event)

  console.log('Received test update payload:', body)

  if (body.id === null || !body.date) {
    throw createError({
      statusCode: 400,
      message: 'ID ve tarih gerekli',
    })
  }

  try {
    const updatedRows = await db('test')
      .where({ id: body.id })
      .update({ test_date: new Date(body.date) })

    return {
      success: true,
      updatedRows,
    }
  }
  catch (error: any) {
    console.error('Test update error:', error)
    throw createError({
      statusCode: 500,
      message: 'Test güncellenirken hata oluştu',
    })
  }
})
