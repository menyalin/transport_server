import ors from 'openrouteservice-js'

export const orsDirections = new ors.Directions({
  api_key: process.env.ORS_API_KEY
})
