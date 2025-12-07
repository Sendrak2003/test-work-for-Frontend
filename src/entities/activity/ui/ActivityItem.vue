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
import { ACTIVITY_ICONS, ACTIVITY_COLORS, ACTIVITY_LABELS } from '../model'
import { formatDate } from '@/shared/lib'
import type { ActivityEntry } from '../model'

defineProps<{
  activity: ActivityEntry
}>()
</script>

<style scoped>
.activity-item {
  border-bottom: 1px solid rgba(128, 128, 128, 0.15);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.task-name {
  font-weight: 500;
  word-break: break-word;
  white-space: normal;
  line-height: 1.3;
}

.activity-time {
  white-space: nowrap;
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .activity-time {
    font-size: 10px !important;
  }
}
</style>

