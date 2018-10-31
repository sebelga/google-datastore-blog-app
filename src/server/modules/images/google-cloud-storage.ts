import async from 'async';
import arrify from 'arrify';
import { Context } from './models';

export interface GoogleCloudStorage {
  uploadFile(fileName: string, mimetype: string, buffer: Buffer): Promise<any>;
  deleteFile(objects: string | Array<string>): Promise<any>;
}

export default ({ config, logger, storage }: Context): GoogleCloudStorage => {
  const bucketId = config.gcloud.storage.bucket;
  const bucket = storage.bucket(bucketId);

  /**
   * Returns the public, anonymously accessible URL to a given Cloud Storage
   * object. The object's ACL has to be set to public read.
   *
   * @param {string} objectName -- Storage object to retrieve
   */
  const getPublicUrl = (objectName: string) => `https://storage.googleapis.com/${bucketId}/${objectName}`;

  const uploadFile = (fileName: string, mimetype: string, buffer: Buffer) => {
    return new Promise((resolve, reject) => {
      const gcsname = Date.now() + fileName.replace(/\W+/g, '-').toLowerCase();
      const googleStorageFile = bucket.file(gcsname);

      const stream = googleStorageFile.createWriteStream({
        metadata: {
          contentType: mimetype,
          cacheControl: 'public, max-age=31536000', // 1 year of cache
        },
        validation: 'crc32c',
        predefinedAcl: 'publicRead',
      });

      stream.on('error', reject);

      stream.on('finish', () => {
        resolve({
          cloudStorageObject: gcsname,
          cloudStoragePublicUrl: getPublicUrl(gcsname),
        });
      });

      stream.end(buffer);
    });
  };

  /**
   * Delete one or many objects from the Google Storage Bucket
   * @param {string | array} objects -- Storage objects to delete
   */
  const deleteFile = (objects: string | Array<string>) => {
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
    uploadFile,
    deleteFile,
  };
};
