import { AddressService } from '../../services/index.js'

export const getSuggestions = async (req, res) => {
  try {
    const { address } = req.query
    const suggestions = await AddressService.getSuggestions(
      address,
      req.userId
    )
    res.status(200).json(suggestions)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const createAddress = async (req, res) => {
  try {
    const newAddress = await AddressService.create(req.body)
    res.status(201).json(newAddress)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const updateAddress = async (req, res) => {
  try {
    const address = await AddressService.updateOne(req.params.id, req.body)
    res.status(200).json(address)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const searchAddress = async (req, res) => {
  try {
    const newAddress = await AddressService.search(req.query.search)
    res.status(201).json(newAddress)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const getProfileAddresses = async (req, res) => {
  try {
    const addresses = await AddressService.getByProfile(req.query.profile)
    res.status(200).json(addresses)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const getById = async (req, res) => {
  try {
    const address = await AddressService.getById(req.params.id)
    res.status(200).json(address)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const deleteById = async (req, res) => {
  try {
    const address = await AddressService.deleteById(req.params.id)
    res.status(200).json(address)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}
