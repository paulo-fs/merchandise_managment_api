import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import CustomMessages from '../customMessages'

export default class StoreValidator extends CustomMessages {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    name: schema.string({ trim: true }, [
      rules.maxLength(50),
      rules.minLength(3),
      rules.regex(/^[ a-zA-ZÀ-ÿ\u00f1\u00d1]*$/g),
    ]),

    code: schema.string({ trim: true }, [
      rules.maxLength(250),
      rules.unique({ table: 'products', column: 'code' }),
    ]),

    price: schema.number([rules.unsigned()]),

    categories: schema
      .array([rules.minLength(1)])
      .members(
        schema.string({ trim: true }, [rules.exists({ table: 'categories', column: 'name' })])
      ),
  })
}
