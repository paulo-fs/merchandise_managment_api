import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Cart from 'App/Models/Cart'

import StoreValidator from 'App/Validators/Cart/StoreValidator'
import UpdateValidator from 'App/Validators/Cart/UpdateValidator'

export default class CartController {
  public async index({ auth, response }: HttpContextContract) {
    const userAuthenticated = auth.user?.id
    let cartInfo = { itensQuantity: 0, totalPrice: 0 }

    if (userAuthenticated) {
      try {
        const itemsCart = await Cart.query()
          .where('user_id', userAuthenticated)
          .preload('user', (queryUser) => {
            queryUser.select('id', 'name', 'email')
          })
          .preload('product', (queryProduct) => {
            queryProduct.select('id', 'name', 'code', 'price')
          })

        itemsCart.forEach(({ quantity, product }, index) => {
          ;(cartInfo.totalPrice += product.price * quantity), (cartInfo.itensQuantity = index + 1)
        })
        return response.ok({ cartInfo, itemsCart })
      } catch (error) {
        return response.notFound({
          message: 'Cart items not found',
          originalMessage: error.message,
        })
      }
    } else {
      return response.unauthorized({ message: 'You need to be signed' })
    }
  }

  public async store({ request, response, auth }: HttpContextContract) {
    await request.validate(StoreValidator)
    let bodyCart = request.only(['user_id', 'product_id', 'quantity'])
    bodyCart.user_id = auth.user?.id

    const hadProductInCart = await Cart.query()
      .where('user_id', bodyCart.user_id)
      .andWhere('product_id', bodyCart.product_id)
      .first()

    if (hadProductInCart)
      return response.badRequest({ message: 'This product is alread in the cart' })

    try {
      const cart = await Cart.create(bodyCart)
      return response.ok(cart)
    } catch (error) {
      return response.badRequest({
        message: 'Error in register item in the cart',
        originalError: error.message,
      })
    }
  }

  public async show({ response, auth, params }: HttpContextContract) {
    const userAuthenticated = auth.user?.id
    const productId = params.id

    if (userAuthenticated) {
      try {
        const itemCart = await Cart.query()
          .where('user_id', userAuthenticated)
          .andWhere('product_id', productId)
          .preload('user', (queryUser) => {
            queryUser.select('id', 'name', 'email')
          })
          .preload('product', (queryProduct) => {
            queryProduct.select('id', 'name', 'code', 'price')
          })
          .firstOrFail()

        const totalPrice = itemCart.quantity * itemCart.product.price
        return response.ok({ priceItemTotal: totalPrice, itemCart })
      } catch (error) {
        return response.notFound({ message: 'Cart item not found', originalError: error.message })
      }
    } else {
      return response.unauthorized({ message: 'You need to be signed' })
    }
  }

  public async update({ request, response, auth, params }: HttpContextContract) {
    await request.validate(UpdateValidator)

    const userAuthenticated = auth.user?.id
    const productId = params.id
    const { addQtdItem, removeQtdItem } = request.all()

    if (userAuthenticated) {
      try {
        const itemCart = await Cart.query()
          .where('user_id', userAuthenticated)
          .andWhere('product_id', productId)
          .firstOrFail()

        if (addQtdItem) {
          itemCart.quantity += 1
        } else if (removeQtdItem) {
          itemCart.quantity -= 1
        }

        await itemCart.save()
        return response.ok(itemCart)
      } catch (error) {
        return response.notFound({ message: 'Item not found', originalError: error.message })
      }
    } else {
      return response.unauthorized({ message: 'You need to be signed' })
    }
  }

  public async destroy({ response, auth, params }: HttpContextContract) {
    const userAuthenticated = auth.user?.id
    const productId = params.id

    if (userAuthenticated) {
      try {
        const itemCart = await Cart.query()
          .where('user_id', userAuthenticated)
          .andWhere('product_id', productId)
          .firstOrFail()
        await itemCart.delete()
        return response.ok({ message: 'Item removed successfully' })
      } catch (error) {
        return response.notFound({ message: 'Cart item not found', originalError: error.message })
      }
    } else {
      return response.unauthorized({ message: 'You need to be signed' })
    }
  }
}
