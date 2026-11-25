import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '@/stores/cart'

const mouse = { id: 3, title: 'Миша Glide Pro', price: 890 }

describe('useCartStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('додає товар у порожній кошик', () => {
    const cart = useCartStore()
    cart.add(mouse)

    expect(cart.items.length).toBe(1)
    expect(cart.items[0].qty).toBe(1)
  })

  it('повторне додавання збільшує кількість', () => {
    const cart = useCartStore()

    cart.add(mouse)
    cart.add(mouse)

    expect(cart.items.length).toBe(1) // рядок у кошику один
    expect(cart.totalCount).toBe(2)   // але штук дві
  })

  it('рахує загальну суму', () => {
    const cart = useCartStore()

    cart.add(mouse)
    cart.add(mouse)

    expect(cart.totalPrice).toBe(1780) // 890 × 2
  })

  it('мінус при кількості 1 прибирає товар', () => {
    const cart = useCartStore()

    cart.add(mouse)
    cart.changeQty(mouse.id, -1)

    expect(cart.items.length).toBe(0)
  })
})