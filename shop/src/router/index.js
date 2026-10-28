import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import CartView from '@/views/CartView.vue'
import OrdersView from '@/views/OrdersView.vue'
import UsersView from '@/views/UsersView.vue'

const router = createRouter({
  history: createWebHistory(),
  linkExactActiveClass: 'active', // підсвічувати активне посилання в меню
  routes: [
    { path: '/', component: HomeView },
    { path: '/cart', component: CartView },
    { path: '/orders', component: OrdersView },
    { path: '/users', component: UsersView },
  ],
})

export default router