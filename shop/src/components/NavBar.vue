<script setup>
import { useCartStore } from '@/stores/cart'
const cart = useCartStore()
</script>

<template>
  <nav class="navbar navbar-expand navbar-dark bg-dark">
    <div class="container">
      <RouterLink class="navbar-brand" to="/">🛒 MiniShop</RouterLink>
      <div class="navbar-nav">
        <RouterLink class="nav-link" to="/">Товари</RouterLink>
        <RouterLink class="nav-link" to="/cart">
          Кошик
          <RouterLink class="nav-link" to="/users">Користувачі</RouterLink>
          <span v-if="cart.totalCount" class="badge bg-primary">{{ cart.totalCount }}</span>
          <RouterLink class="nav-link" to="/orders">Замовлення</RouterLink>
        </RouterLink>
      </div>
    </div>
  </nav>
</template>
