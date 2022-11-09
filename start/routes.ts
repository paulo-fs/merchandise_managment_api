/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import Database from '@ioc:Adonis/Lucid/Database'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Drive from '@ioc:Adonis/Core/Drive'

Route.get('test_db_connection', async ({ response }: HttpContextContract) => {
  await Database.report().then(({ health }) => {
    const { healthy, message } = health
    if (healthy) return response.ok({ message })
    return response.status(500).json({ message })
  })
})

// PUBLIC ROUTES
Route.group(() => {
  Route.post('login', 'AuthController.login')
  Route.post('users/', 'UsersController.store')
  Route.resource('redis', 'TestRedisController').only(['show', 'destroy', 'store'])
}).prefix('api')

// CLIENT ROUTES
Route.group(() => {
  Route.resource('users/', 'UsersController').except(['store', 'index', 'destroy'])
  Route.resource('products/', 'ProductsController').except(['store', 'destroy', 'update'])
  Route.resource('cart/', 'CartController').apiOnly()
  Route.resource('purchases/', 'PurchasesController').only(['store', 'index', 'show'])
})
  .prefix('api')
  .middleware(['auth', 'is:client'])

// EMPLOYEE ROUTES
Route.group(() => {
  Route.resource('products/', 'ProductsController').only(['store', 'destroy', 'update'])
  Route.resource('categories/', 'CategoriesController').apiOnly()
})
  .prefix('api')
  .middleware(['auth', 'is:employee'])

// ADMIN ROUTES
Route.group(() => {
  Route.resource('users/', 'UsersController').only(['index', 'destroy'])
  Route.post('users/access_allow', 'UsersController.AccessAllow')
})
  .prefix('api')
  .middleware(['auth', 'is:admin'])

Route.get('getImageToS3', async () => {
  const s3 = await Drive.use('s3')
  try {
    const url = await s3.getUrl('images_profiles/profile_pic_PauloFS_553.123.123-12.jpg')
    console.log('esse da url', url)
    return url
  } catch (error) {
    console.log('esse do erro', error)
    throw new Error('Error in get file from url by S3 AWS')
  }
})
