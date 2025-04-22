// utils/CustomError.js
export class CustomError extends Error {
    constructor(status = 500, message = 'Error interno', details = []) {
      super(message);
      this.status = status;
      this.details = details;
    }
  }
  

  