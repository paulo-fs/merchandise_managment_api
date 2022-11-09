import Redis from '@ioc:Adonis/Addons/Redis'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class TestRedisController {
  public async store({ response }: HttpContextContract) {
    const myName = await Redis.set('nome', 'Paulo')
    return response.ok({ myName })
  }

  public async show({ response }: HttpContextContract) {
    const myName = await Redis.get('nome')
    return response.ok({ myName })
  }

  public async destroy({ response }: HttpContextContract) {
    await Redis.del('nome')
    return response.ok('key deleted')
  }
}
