
'use strict';

const storage = require('@google-cloud/storage')();
const async = require('async');
const is = require('is');
const config = require('../config');
const logger = require('winston');

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

const bucketId = config.gcloud.storageBucket;
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
 * req.file is processed and we add a "cloudStorageObject" and "cloudStoragePublicUrl" property to it
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

const deleteFromGCS = (storageObjects, cb) => {
    const fns = [];

    if (is.object(storageObjects)) {
        Object.keys(storageObjects).forEach((k) => {
            fns.push(processDelete(storageObjects[k]));
        });
    } else {
        fns.push(processDelete(storageObjects));
    }

    async.parallel(fns, (err) => {
        logger.info('End Deleting Files GCS', err);

        if (err) {
            return cb(err);
        }
        cb(null);
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
