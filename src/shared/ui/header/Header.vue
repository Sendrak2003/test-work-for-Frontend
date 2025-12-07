<template>
  <v-app-bar color="primary" density="compact">
    <img
      src="/favicon.ico"
      alt="Logo"
      class="logo ml-4 mr-4"
    />
    <v-app-bar-title>{{ title }}</v-app-bar-title>
    
    <v-spacer />
    
    <v-btn 
      icon 
      @click="$emit('toggle-theme')"
      variant="text"
    >
      <v-icon>{{ darkMode ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  darkMode: boolean
}>()

defineEmits<{
  'toggle-theme': []
}>()
</script>

<style scoped>
.logo {
  width: 50px;
  height: 50px;
}
</style>

