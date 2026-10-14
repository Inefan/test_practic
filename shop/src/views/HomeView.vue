<script setup>
import ProductCard from '@/components/ProductCard.vue'
import { ref, computed } from 'vue'
import { products } from '@/data/products'

const search = ref('')

// Лише ті товари, в назві яких є текст пошуку
const filtered = computed(() =>
  products.filter(p => {   
    if (search.value.length >= 3 || search.value.length === 0)
        return p.title.toLowerCase().includes(search.value.toLowerCase())
  })
)
</script>

<template>
  <h1 class="mb-4">Товари</h1>

  <input v-model="search" class="form-control mb-4" placeholder="Пошук товару..." />

  <div class="row g-4">
    <div v-for="product in filtered" :key="product.id" class="col-12 col-sm-6 col-lg-4">
  <ProductCard :product="product" />
</div>

  </div>

  <p v-if="filtered.length === 0" class="text-muted">Нічого не знайдено.</p>
</template>
