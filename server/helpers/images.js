
'use strict';

const Storage = require('@google-cloud/storage');
const async = require('async');
const arrify = require('arrify');
const logger = require('winston');

const config = require('../config');

const storage = new Storage({
    projectId: config.gcloud.projectId,
});

/**
 * Multer handles parsing multipart/form-data requests.
 * This instance is configured to store images in memory and re-name to avoid
 * conflicting with existing objects.
 * This makes it straightforward to upload to Cloud Storage.
 */
const multer = require('multer')({
    inMemory: true,
    fileSize: 5 * 1024 * 1024, // no larger than 5mb
    rename(fieldname, filename) {
        // generate a unique filename
        return filename.replace(/\W+/g, '-').toLowerCase() + Date.now();
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
const getPublicUrl = objectName => `https://storage.googleapis.com/${bucketId}/${objectName}`;

/**
 * Express middleware that will automatically upload to Cloud Storage
 * req.file is processed and we add a "cloudStorageObject" and "cloudStoragePublicUrl"
 * property to the request object
 */
const uploadToGCS = (req, res, next) => {
    if (!req.file) {
        return next();
    }

    const imageOptions = {
        mimeTypes: ['image/jpeg', 'image/png'],
        maxSize: 10000,
    };

    // Validate image type
    if (imageOptions.mimeTypes.indexOf(req.file.mimetype) < 0) {
        return res.status(400).send(`File type not allowed: ${req.file.mimetype}`);
    }

    // Validate image size
    if (req.file.size / 1024 > imageOptions.maxSize) {
        return res.status(400).send(`File size too big: ${req.file.size}`);
    }

    const fileOptions = {
        mimetype: req.file.mimetype,
    };

    return uploadFile(next);

    // ----------

    function uploadFile(cb) {
        const gcsname = Date.now() + req.file.originalname;
        const file = bucket.file(gcsname);

        const stream = file.createWriteStream({
            metadata: {
                contentType: fileOptions.mimetype,
            },
            validation: 'crc32c',
        });

        stream.on('error', (err) => {
            req.file.cloudStorageError = err;
            cb(err);
        });

        stream.on('finish', () => {
            req.file.cloudStorageObject = gcsname;
            req.file.cloudStoragePublicUrl = getPublicUrl(gcsname);

            cb();
        });

        stream.end(req.file.buffer);
    }
};

/**
 * Delte one or many objects from the Google Storage Bucket
 * @param {string | array} _storageObjects -- Storage objects to delete
 */
const deleteFromGCS = (_storageObjects) => {
    const storageObjects = arrify(_storageObjects);
    const fns = storageObjects.map(o => processDelete(o));

    return new Promise((resolve, reject) => {
        async.parallel(fns, (err) => {
            if (err) {
                return reject(err);
            }

            logger.info('All object deleted successfully from Google Storage');

            return resolve();
        });
    });

    // ----------

    function processDelete(fileName) {
        return (cb) => {
            logger.info(`Deleting GCS file ${fileName}`);

            const file = bucket.file(fileName);

            file.delete((err, apiResponse) => {
                if (err && err.code !== 404) {
                    return cb(err);
                }
                cb(null);
            });
        };
    }
}

module.exports = {
    getPublicUrl,
    uploadToGCS,
    deleteFromGCS,
    multer,
};
