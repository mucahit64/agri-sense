<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode: number
    message: string
  }
}>()

const is404 = computed(() => props.error.statusCode === 404)

function goHome() {
  clearError({ redirect: '/dashboard' })
}
</script>

<template>
  <div class="fullscreen column items-center justify-center text-center q-pa-md bg-grey-1">
    <div class="text-h1 text-weight-bold text-green-8" style="font-size: 8rem; line-height: 1;">
      {{ error.statusCode }}
    </div>

    <div class="text-h4 text-weight-medium text-grey-8 q-mt-md">
      {{ is404 ? 'Sayfa Bulunamadı' : 'Bir Hata Oluştu' }}
    </div>

    <div class="text-body1 text-grey-6 q-mt-sm" style="max-width: 400px;">
      {{ is404 ? 'Aradığınız sayfa mevcut değil veya taşınmış olabilir.' : error.message }}
    </div>

    <q-btn
      unelevated
      color="green-8"
      icon="home"
      label="Ana Sayfaya Dön"
      class="q-mt-lg"
      size="lg"
      @click="goHome"
    />
  </div>
</template>

<style scoped>
.fullscreen {
  min-height: 100vh;
  user-select: none;
}
</style>
