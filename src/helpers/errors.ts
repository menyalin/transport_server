export class CustomError extends Error {
  constructor(
    public message: string,
    public statusCode: number
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class BadRequestError extends CustomError {
  constructor(message: string) {
    super(message, 400)
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string) {
    super(message, 404)
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string) {
    super(message, 403)
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string) {
    super(message, 401)
  }
}

export class ConflictResourceError extends CustomError {
  constructor(message: string) {
    super(message, 409)
  }
}
