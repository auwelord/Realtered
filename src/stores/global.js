// stores/counter.js
import { defineStore } from 'pinia';

export const useGlobalStore = defineStore('global', {
  state: () => ({
    modesombre: true,
    database: true,
    language: 'fr',
    lastVisitedPage: null,
  }),
  actions: 
  {
    isFrenchLanguage() {
      return this.language == 'fr';
    },
  },
  persist: {
    enabled: true,
    // Customize storage options
    strategies: [
      {
        key: 'globalStore', // The key to store in localStorage
        storage: localStorage, // Use localStorage (default)
        paths: ['modesombre', 'database', 'language', 'lastVisitedPage'], // Optionally specify which part of the state to persist
      },
    ],
}});