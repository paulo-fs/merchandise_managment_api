import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import CustomMessages from './customMessages'

export default class AccessAllowValidator extends CustomMessages {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    roles: schema
      .array([rules.minLength(1)])
      .members(schema.string({ trim: true }, [rules.exists({ table: 'roles', column: 'name' })])),
  })
}
