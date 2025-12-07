<template>
  <v-app :theme="settings.darkMode ? 'dark' : 'light'">
    <TasksPage />
  </v-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { TasksPage } from '@/pages/tasks'
import { useSettingsStore } from '@/entities/settings'
import { storeToRefs } from 'pinia'

const settingsStore = useSettingsStore()
const { settings } = storeToRefs(settingsStore)

onMounted(() => {
  settingsStore.load()
})
</script>

