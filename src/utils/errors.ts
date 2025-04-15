export class BaseError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends BaseError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class ConflictError extends BaseError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class ConsentExpiredError extends ValidationError {
  constructor(message: string = 'Consent has expired') {
    super(message);
  }
}

export class InvalidConsentError extends ValidationError {
  constructor(message: string = 'Invalid consent') {
    super(message);
  }
} 