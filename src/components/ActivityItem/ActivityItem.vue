<template>
  <v-list-item class="activity-item py-2">
    <template v-slot:prepend>
      <v-avatar 
        :color="ACTIVITY_COLORS[activity.action]" 
        size="32"
        class="mr-3"
      >
        <v-icon size="small" color="white">
          {{ ACTIVITY_ICONS[activity.action] }}
        </v-icon>
      </v-avatar>
    </template>
    
    <div class="activity-content">
      <div class="d-flex align-center justify-space-between flex-wrap gap-1">
        <strong class="text-body-2">{{ ACTIVITY_LABELS[activity.action] }}</strong>
        <span class="activity-time text-caption text-medium-emphasis">
          <v-icon size="x-small" class="mr-1">mdi-clock-outline</v-icon>
          {{ formatDate(activity.timestamp) }}
        </span>
      </div>
      <div class="text-caption text-medium-emphasis task-name">
        {{ activity.taskTitle }}
      </div>
    </div>
  </v-list-item>
</template>

<script setup lang="ts">
import { ACTIVITY_ICONS, ACTIVITY_COLORS, ACTIVITY_LABELS } from '@/types'
import { formatDate, truncateText } from '@/composables'
import type { ActivityItemProps } from './types'

defineProps<ActivityItemProps>()
</script>

<style src="./styles.css" scoped />
