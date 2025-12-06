<template>
  <v-card class="mt-6">
    <v-card-text>
      <p>Всего задач: {{ stats.total }}</p>
      <p>Активных: {{ stats.active }}</p>
      <p>Завершенных: {{ stats.completed }}</p>
      <p>Процент завершения: {{ stats.percentage }}%</p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { TaskStatsProps } from './types'

defineProps<TaskStatsProps>()
</script>

