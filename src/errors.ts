export class InvalidVersionError extends Error {
  constructor(gameVersion: string) {
    super(
      `Version "${gameVersion}" could not be found or is not supported by the loader`
    );
  }
}
