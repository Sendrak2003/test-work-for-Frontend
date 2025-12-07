export interface AppSettings {
  darkMode: boolean
}

export const STORAGE_KEY = 'tasks-app-settings' as const

export const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false
}

