class CustomError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);

    this.name = 'CustomError';

    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export { CustomError };
