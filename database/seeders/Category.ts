import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Category from 'App/Models/Category'

export default class extends BaseSeeder {
  public static developmentOnly = true

  public async run() {
    const uniqueKey = 'name'

    await Category.updateOrCreateMany(uniqueKey, [
      {
        name: 'Açougue',
        observation: 'Carnes em geral',
      },
      {
        name: 'Limpeza',
        observation: 'Produtos de limpez em geral',
      },
      {
        name: 'Higiene',
        observation: 'Produtos de higiene em geral',
      },
      {
        name: 'Hortifruit',
        observation: 'Frutas, legues e frios',
      },
    ])
  }
}
