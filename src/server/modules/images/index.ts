import async from 'async';
import arrify from 'arrify';
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { Context } from './models';

export interface ImagesModule {
  getPublicUrl(objectName: string): string;
  uploadToGCS(req: Request, _: Response, next: NextFunction): void;
  deleteFromGCS(objects: string | Array<string>): Promise<{}>;
  upload: multer.Instance;
}

export default ({ config, logger, storage }: Context): ImagesModule => {
  /**
   * Multer handles parsing multipart/form-data requests.
   * This instance is configured to store images in memory and re-name to avoid
   * conflicting with existing objects.
   * This makes it straightforward to upload to Cloud Storage.
   */
  const upload = multer({
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
  });

  const bucketId = config.gcloud.storage.bucket;
  const bucket = storage.bucket(bucketId);

  /**
   * Returns the public, anonymously accessible URL to a given Cloud Storage
   * object. The object's ACL has to be set to public read.
   *
   * @param {string} objectName -- Storage object to retrieve
   */
  const getPublicUrl = (objectName: string) => `https://storage.googleapis.com/${bucketId}/${objectName}`;

  /**
   * Express middleware that will automatically upload a file to Google Cloud Storage
   * Once the "req.file" is processed we add a "cloudStorageObject" and "cloudStoragePublicUrl"
   * property to the request object
   */
  const uploadToGCS = (req: Request, _: Response, next: NextFunction) => {
    if (!req.file) {
      return next();
    }
    const gcsname = Date.now() + req.file.originalname.replace(/\W+/g, '-').toLowerCase();
    const file = bucket.file(gcsname);

    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
        cacheControl: 'public, max-age=31536000', // 1 year of cache
      },
      validation: 'crc32c',
      predefinedAcl: 'publicRead',
    });

    stream.on('error', err => {
      (<any>req.file).cloudStorageError = err;
      next(err);
    });

    stream.on('finish', () => {
      (<any>req.file).cloudStorageObject = gcsname;
      (<any>req.file).cloudStoragePublicUrl = getPublicUrl(gcsname);

      next();
    });

    stream.end(req.file.buffer);
  };

  /**
   * Delete one or many objects from the Google Storage Bucket
   * @param {string | array} objects -- Storage objects to delete
   */
  const deleteFromGCS = (objects: string | Array<string>) => {
    return new Promise((resolve, reject) => {
      const storageObjects = arrify(objects);
      const fns = storageObjects.map(o => processDelete(o));

      async.parallel(fns, err => {
        if (err) {
          return reject(err);
        }

        logger.info('All object deleted successfully from Google Storage');

        return resolve();
      });
    });

    // ----------

    function processDelete(fileName: string) {
      return (cb: async.AsyncFunction<null, Error>) => {
        logger.info(`Deleting GCS file ${fileName}`);

        const file = bucket.file(fileName);
        file.delete().then(
          () => cb(null),
          err => {
            if (err && err.code !== 404) {
              return cb(err);
            }
            cb(null);
          }
        );
      };
    }
  };

  return {
    getPublicUrl,
    uploadToGCS,
    deleteFromGCS,
    upload,
  };
};
