export default class Mp3Error extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);

    this.name = "Mp3Error";
    this.statusCode = statusCode;
  }
}
