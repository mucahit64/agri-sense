<script setup lang="ts">
defineProps<{ icon: string, value: string, label: string }>()
</script>

<template>
  <div class="col-6 text-center">
    <q-icon
      :name="icon"
      size="32px"
      color="green-8"
    />
    <div class="text-h6">
      {{ value }}
    </div>
    <div class="text-caption text-grey-7">
      {{ label }}
    </div>
  </div>
</template>
