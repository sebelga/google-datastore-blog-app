import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { GoogleCloudStorage } from './google-cloud-storage';

export interface ImagesMiddleware {
  uploadInMemory: multer.Instance;
  uploadToGCS(req: Request, _: Response, next: NextFunction): void;
}

export default (googleCloudStorage: GoogleCloudStorage): ImagesMiddleware => ({
  /**
   * Multer handles parsing multipart/form-data requests.
   * This instance is configured to store images in memory
   */
  uploadInMemory: multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // no larger than 5mb
    },
    fileFilter: (req, file, cb) => {
      // Validate image type
      if (['image/jpeg', 'image/png'].indexOf(file.mimetype) < 0) {
        const err = new Error(`File type not allowed: ${req.file.mimetype}`);
        return cb(err, false);
      }
      return cb(null, true);
    },
  }),
  /**
   * Middleware to upload a file in memory (buffer) to Google Cloud Storage
   * Once the file is processed we add a "cloudStorageObject" and "cloudStoragePublicUrl" property
   */
  uploadToGCS(req, _, next) {
    if (!req.file) {
      return next();
    }

    const { originalname, mimetype, buffer } = req.file;
    googleCloudStorage
      .uploadFile(originalname, mimetype, buffer)
      .then(({ cloudStorageObject, cloudStoragePublicUrl }: any) => {
        (<any>req.file).cloudStorageObject = cloudStorageObject;
        (<any>req.file).cloudStoragePublicUrl = cloudStoragePublicUrl;
        next();
      })
      .catch((err: any) => {
        next(err);
      });
  },
});
