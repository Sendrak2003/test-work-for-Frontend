<template>
  <div>
    <h2 class="text-h5 mb-4">
      <v-icon class="mr-2">mdi-history</v-icon>
      Лента изменений
    </h2>
    
    <v-card class="activity-feed" elevation="1">
      <v-list dense v-if="activities.length > 0">
        <ActivityItem
          v-for="(activity, index) in activities"
          :key="index"
          :activity="activity"
        />
      </v-list>
      
      <v-card-text v-else class="text-center text-grey">
        <v-icon size="48" class="mb-2">mdi-clipboard-text-clock-outline</v-icon>
        <p>Пока нет активности</p>
      </v-card-text>
    </v-card>
    
    <v-btn 
      v-if="activities.length > 0"
      @click="$emit('clear')"
      variant="text"
      color="grey"
      size="small"
      class="mt-2"
    >
      Очистить историю
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { ActivityItem } from '@/components/ActivityItem'
import type { ActivityFeedProps, ActivityFeedEmits } from './types'

defineProps<ActivityFeedProps>()
defineEmits<ActivityFeedEmits>()
</script>

<style src="./styles.css" scoped />

