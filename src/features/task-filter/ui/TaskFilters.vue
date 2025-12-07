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
import type { TaskFilter, TaskSort, TaskStats } from '@/entities/task'

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

<style scoped>
.filters-container {
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: rgba(128, 128, 128, 0.05);
  border-radius: 8px;
  margin-bottom: 16px;
}

.search-field {
  max-width: 100%;
}

.filters-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
}

.filter-toggle {
  flex-shrink: 0;
}

.sort-select {
  min-width: 140px;
  max-width: 180px;
}

@media (max-width: 600px) {
  .filters-container {
    padding: 12px;
  }
  
  .filters-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .filter-toggle {
    width: 100%;
  }
  
  .filter-toggle .v-btn {
    flex: 1;
  }
  
  .sort-select {
    width: 100%;
    max-width: 100%;
    margin-top: 4px;
  }
}
</style>

