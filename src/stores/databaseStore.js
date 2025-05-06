// /src/stores/databaseStore.js
import { defineStore } from 'pinia'
import axiosClient from '../axios'

export const useDatabaseStore = defineStore('database', {
  state: () => ({
    users: [],
    roads: [],
  }),
  actions: {
    async fetchData() {
      const API_KEY = import.meta.env.VITE_API_KEY
      try {
        // Execute all requests concurrently
        const [ resUsers,resRoads] = await Promise.all([
          axiosClient.get('/api/users', { headers: { 'x-api-key': API_KEY } }),
          axiosClient.get('/api/traffic-tracking/roads', { headers: { 'x-api-key': API_KEY } }),
        ])

        // Map or assign the fetched data
        this.users = resUsers.data
        this.roads = resRoads.data

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },   
  },
})
