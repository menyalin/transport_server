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

//
