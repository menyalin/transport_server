import { AddressService } from '../services/index.js'

export const getById = async (req, res) => {
  try {
    const address = await AddressService.getById(req.params.id)
    res.status(200).json(address)
  } catch (e) {
    res.status(e.statusCode || 500).json(e.message)
  }
}

export const searchAddress = async (req, res) => {
  try {
    const addresses = await AddressService.search(
      req.query.search,
      req.query.profile
    )
    res.status(200).json(addresses)
  } catch (e) {
    res.status(e.statusCode || 500).json(e.message)
  }
}

export const createAddress = async (req, res) => {
  try {
    const newAddress = await AddressService.create({
      body: req.body,
      user: req.userId,
      company: req.companyId
    })
    res.status(201).json(newAddress)
  } catch (e) {
    res.status(e.statusCode || 500).json(e.message)
  }
}
