export class GenericError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Generic Error';
  }
}

export class UserNotFoundError extends GenericError {
  constructor(public detail?: string) {
    super("The specified user was not found.");
    this.name = 'UserNotFoundError';
  }
}