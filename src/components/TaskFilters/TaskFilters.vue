<template>
  <div class="filters-container mb-4">
    <!-- Поиск -->
    <v-text-field
      :model-value="searchQuery"
      @update:model-value="$emit('update:searchQuery', $event)"
      label="Поиск задач"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="compact"
      clearable
      hide-details
      class="search-field mb-3"
    />
    
    <div class="filters-row">
      <!-- Фильтры по статусу -->
      <v-btn-toggle
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        mandatory
        density="compact"
        color="primary"
        class="filter-toggle"
      >
        <v-btn value="all" size="small">
          <span class="d-none d-sm-inline">Все</span> ({{ stats.total }})
        </v-btn>
        <v-btn value="active" size="small">
          <span class="d-none d-sm-inline">Активные</span>
          <span class="d-sm-none">Акт.</span> ({{ stats.active }})
        </v-btn>
        <v-btn value="completed" size="small">
          <span class="d-none d-sm-inline">Завершённые</span>
          <span class="d-sm-none">Зав.</span> ({{ stats.completed }})
        </v-btn>
      </v-btn-toggle>
      
      <!-- Сортировка -->
      <v-select
        :model-value="sortBy"
        @update:model-value="$emit('update:sortBy', $event)"
        :items="sortItems"
        label="Сортировка"
        variant="outlined"
        density="compact"
        hide-details
        class="sort-select"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TaskFilter, TaskSort, TaskStats } from '@/types'

defineProps<{
  modelValue: TaskFilter
  sortBy: TaskSort
  searchQuery: string
  stats: TaskStats
}>()

defineEmits<{
  'update:modelValue': [value: TaskFilter]
  'update:sortBy': [value: TaskSort]
  'update:searchQuery': [value: string]
}>()

const sortItems = [
  { value: 'date', title: 'По дате' },
  { value: 'priority', title: 'По приоритету' },
  { value: 'name', title: 'По названию' }
]
</script>

<style src="./styles.css" scoped />
