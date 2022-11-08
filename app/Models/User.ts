import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'

import {
  BaseModel,
  beforeCreate,
  beforeSave,
  column,
  HasMany,
  hasMany,
  ManyToMany,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'

import { compose } from '@ioc:Adonis/Core/Helpers'
import { Filterable } from '@ioc:Adonis/Addons/LucidFilter'
import UserFilter from './Filters/UserFilter'

import Address from './Address'
import Purchase from './Purchase'
import Role from './Role'

export default class User extends compose(BaseModel, Filterable) {
  public static $filter = () => UserFilter

  @column({ isPrimary: true })
  public id: number

  @column()
  public secureId: string

  @column({ serializeAs: null })
  public rememberMeToken?: string

  @column()
  public name: string

  @column()
  public cpf: string

  @column()
  public urlProfilePic: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Address)
  public addresses: HasMany<typeof Address>

  @hasMany(() => Purchase)
  public purchases: HasMany<typeof Purchase>

  @manyToMany(() => Role, {
    pivotTable: 'user_roles',
  })
  public roles: ManyToMany<typeof Role>

  @beforeCreate()
  public static aassignUuid(user: User) {
    user.secureId = uuidv4()
  }

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
