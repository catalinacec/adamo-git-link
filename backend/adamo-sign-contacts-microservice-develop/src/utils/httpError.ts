export class HttpError extends Error {
  public statusCode: number;
  public code: string;
  public field?: string;
  public errors?: string[];

  constructor(
    statusCode: number,
    message: string,
    code: string = "UNKNOWN",
    field?: string,
    errors?: string[]
  ) {
    // super(message);
    // this.statusCode = statusCode;

    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.field = field;
    this.errors = errors;
    // Si code es array → lo tratamos como lista de errores
    // if (Array.isArray(code)) {
    //   this.code = "VALIDATION_ERROR";
    //   this.errors = code;
    // } else {
    // this.code = code;
    // }

    // if (field) {
    //   this.field = field;
    // }

    // if (errors) {
    //   this.errors = errors;
    // }

    Object.setPrototypeOf(this, HttpError.prototype);
  }
}
