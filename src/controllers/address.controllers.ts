// @ts-nocheck
import { AddressService, PermissionService } from '../services/index.js'

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
    await PermissionService.check({
      userId: req.userId,
      companyId: req.companyId,
      operation: 'address:write'
    })
    const newAddress = await AddressService.create({
      body: req.body,
      user: req.userId
    })
    res.status(201).json(newAddress)
  } catch (e) {
    res.status(e.statusCode || 500).json(e.message)
  }
}

export const updateAddress = async (req, res) => {
  try {
    await PermissionService.check({
      userId: req.userId,
      companyId: req.companyId,
      operation: 'address:write'
    })
    const address = await AddressService.updateOne({
      id: req.params.id,
      body: req.body,
      user: req.userId
    })
    res.status(200).json(address)
  } catch (e) {
    res.status(e.statusCode || 500).json(e.message)
  }
}

export const getSuggestions = async (req, res) => {
  try {
    const { address } = req.query
    const suggestions = await AddressService.getSuggestions(
      address,
      req.userId
    )
    res.status(200).json(suggestions)
  } catch (e) {
    res.status(e.statusCode || 500).json(e.message)
  }
}

export const getProfileAddresses = async (req, res) => {
  try {
    const addresses = await AddressService.getByProfile(req.query.profile)
    res.status(200).json(addresses)
  } catch (e) {
    res.status(e.statusCode || 500).json(e.message)
  }
}

export const deleteById = async (req, res) => {
  try {
    await PermissionService.check({
      userId: req.userId,
      companyId: req.companyId,
      operation: 'address:delete'
    })
    const address = await AddressService.deleteById({
      id: req.params.id,
      user: req.userId
    })
    res.status(200).json(address)
  } catch (e) {
    res.status(e.statusCode || 500).json(e.message)
  }
}
