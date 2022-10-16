import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UsersController {
  public async index({ response }: HttpContextContract) {
    response.status(200).json({ message: 'Success' })
  }

  public async store({ response, request, logger }: HttpContextContract) {
    const body = request.only(['name'])
    logger.info('user created')
    response.ok({ body })
  }

  public async show({ response }: HttpContextContract) {
    response.ok({ message: 'Mostra um usuário' })
  }

  public async update({ response }: HttpContextContract) {
    response.ok({ message: 'Altra um usuário' })
  }

  public async destroy({ response }: HttpContextContract) {
    response.ok({ message: 'Apaga um usuário' })
  }
}
