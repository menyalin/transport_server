// @ts-nocheck
import ors from 'openrouteservice-js'

// TODO: Перенести в отдельную службу
export const orsDirections = new ors.Directions({
  api_key: process.env.ORS_API_KEY,
})
