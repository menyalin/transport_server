// @ts-nocheck
export class BadRequestError extends Error {
  constructor(error) {
    super(error)
    this.data = { error }
    this.statusCode = 400
  }
}

export class NotFoundError extends Error {
  constructor(error) {
    super(error)
    this.data = { error }
    this.statusCode = 404
  }
}

export class ForbiddenError extends Error {
  constructor(error) {
    super(error)
    this.data = { error }
    this.statusCode = 403
  }
}

export class UnauthorizedError extends Error {
  constructor(error) {
    super(error)
    this.data = { error }
    this.statusCode = 401
  }
}
