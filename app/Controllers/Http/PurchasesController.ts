import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Cart from 'App/Models/Cart'
import Purchase from 'App/Models/Purchase'

import StoreValidator from 'App/Validators/Purchase/StoreValidator'

export default class PurchasesController {
  public async index({ response, auth }: HttpContextContract) {
    const userAuthenticated = auth.user?.id

    if (userAuthenticated) {
      try {
        const purchaseItems = await Purchase.query()
          .where('user_id', userAuthenticated)
          .preload('user', (queryUser) => queryUser.select('id', 'name', 'email'))
          .preload('product', (productQuery) => productQuery.select('id', 'name', 'code', 'price'))
        return response.ok(purchaseItems)
      } catch (error) {
        return response.notFound({
          message: 'Purchased item not found',
          originalMessage: error.message,
        })
      }
    } else {
      return response.unauthorized({ message: 'You need to be signed' })
    }
  }

  public async store({ request, response, auth }: HttpContextContract) {
    await request.validate(StoreValidator)

    const bodyCart = request.only(['cart_id', 'user_id'])
    bodyCart.user_id = auth.user?.id
    const trx = await Database.beginGlobalTransaction()

    let cartItem
    try {
      cartItem = await Cart.query()
        .where('id', bodyCart.cart_id)
        .where('user_id', bodyCart.user_id)
        .preload('product', (queryProduct) => queryProduct.select('id', 'name', 'code', 'price'))
        .firstOrFail()
    } catch (error) {
      return response.notFound({ message: 'Item cart not found', originalMessage: error.message })
    }

    let purchaseItem
    try {
      const cartItemJSON = cartItem.serialize()
      const bodyPurchase = {
        userId: cartItemJSON.user_id,
        productId: cartItemJSON.product_id,
        pricePaid: cartItemJSON.product.price * cartItemJSON.quantity,
        quantity: cartItemJSON.quantity,
      }

      purchaseItem = await Purchase.create(bodyPurchase)
    } catch (error) {
      await trx.rollback()
      return response.badRequest({
        message: 'Error in add purchase',
        originalMessage: error.message,
      })
    }

    try {
      await cartItem.delete()
    } catch (error) {
      await trx.rollback()
      return response.badRequest({
        message: 'Error in remove item from cart',
        originalMessage: error.message,
      })
    }

    await trx.commit()
    return response.ok(purchaseItem)
  }

  public async show({ params, response, auth }: HttpContextContract) {
    const purchaseID = params.id
    const userAuthenticated = auth.user?.id

    if (userAuthenticated) {
      try {
        const purchaseItem = await Purchase.query()
          .where('user_id', userAuthenticated)
          .andWhere('id', purchaseID)
          .preload('user', (queryUser) => queryUser.select('id', 'name', 'email'))
          .preload('product', (queryProduct) => queryProduct.select('id', 'name', 'code', 'price'))
          .firstOrFail()
        return response.ok(purchaseItem)
      } catch (error) {
        return response.notFound({
          message: 'Purchase item not found',
          originalMessage: error.message,
        })
      }
    } else {
      return response.unauthorized({ message: 'You need to be signed' })
    }
  }
}
