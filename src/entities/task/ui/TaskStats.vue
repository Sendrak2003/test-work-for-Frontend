<template>
  <v-card class="mt-4" elevation="1">
    <v-card-title class="text-h6">
      <v-icon class="mr-2">mdi-chart-box</v-icon>
      Статистика
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="6" sm="3">
          <div class="text-center">
            <div class="text-h6 font-weight-bold">{{ stats.total }}</div>
            <div class="text-caption text-medium-emphasis">Всего задач</div>
          </div>
        </v-col>
        <v-col cols="6" sm="3">
          <div class="text-center">
            <div class="text-h6 font-weight-bold text-success">{{ stats.active }}</div>
            <div class="text-caption text-medium-emphasis">Активных</div>
          </div>
        </v-col>
        <v-col cols="6" sm="3">
          <div class="text-center">
            <div class="text-h6 font-weight-bold text-primary">{{ stats.completed }}</div>
            <div class="text-caption text-medium-emphasis">Завершённых</div>
          </div>
        </v-col>
        <v-col cols="6" sm="3">
          <div class="text-center">
            <div class="text-h6 font-weight-bold">{{ stats.percentage }}%</div>
            <div class="text-caption text-medium-emphasis">Процент завершения</div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { TaskStats } from '../model'

defineProps<{
  stats: TaskStats
}>()
</script>

