import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'development') {
  /**
   * Read environement variables from .env file
   */
  dotenv.config();
}
