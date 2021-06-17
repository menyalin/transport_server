const { User } = require('../../models')

class UserService {
  async findById(id, fields = '-password') {
    const user = await User.findById(id, fields)
    return user
  }

  async find(query, fields = '-password') {
    const tmp = await User.find(query, fields)
    return tmp
  }
}

module.exports = new UserService()
