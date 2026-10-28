<script setup>
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useOrdersStore } from '@/stores/orders'

const cart = useCartStore()
const ordersStore = useOrdersStore()
const router = useRouter()

function checkout() {
  ordersStore.createOrder(cart.items, cart.totalPrice) // створюємо замовлення
  cart.clear()                                         // очищаємо кошик
  router.push('/orders')                               // переходимо до замовлень
}
</script>


<template>
  <h1 class="mb-4">Кошик</h1>

  <div v-if="cart.items.length === 0" class="alert alert-info">
    Кошик порожній. <RouterLink to="/">Перейти до товарів</RouterLink>
  </div>

  <div v-else>
    <table class="table align-middle">
      <thead>
        <tr><th>Товар</th><th>Ціна</th><th>Кількість</th><th>Сума</th><th></th></tr>
      </thead>
      <tbody>
        <tr v-for="item in cart.items" :key="item.id">
          <td>{{ item.title }}</td>
          <td>{{ item.price }} ₴</td>
          <td>{{ item.qty }}</td>
          <td>{{ item.price * item.qty }} ₴</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-danger" @click="cart.remove(item.id)">Видалити</button>
          </td>
        </tr>
      </tbody>
    </table>

    <h4>До сплати: {{ cart.totalPrice }} ₴</h4>
    <button class="btn btn-outline-secondary me-2" @click="cart.clear()">Очистити</button>
    <button class="btn btn-success" @click="checkout">Оформити замовлення</button>
  </div>
</template>
