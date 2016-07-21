
'use strict';

const storage = require('@google-cloud/storage')();
const async = require('async');
const S = require('string');
const is = require('is');
// const lwip = require('lwip');

// Multer handles parsing multipart/form-data requests.
// This instance is configured to store images in memory and re-name to avoid
// conflicting with existing objects. This makes it straightforward to upload
// to Cloud Storage.
const multer = require('multer')({
    inMemory: true,
    fileSize: 5 * 1024 * 1024, // no larger than 5mb
    rename(fieldname, filename) {
        // generate a unique filename
        return filename.replace(/\W+/g, '-').toLowerCase() + Date.now();
    },
});

const config = require('../config');

const bucketId = config.gcloud.storageBucket;
const bucket = storage.bucket(bucketId);

/**
 * Returns the public, anonymously accessable URL to a given Cloud Storage
 * object. The object's ACL has to be set to public read.
 *
 * @param {string} filename --file to retrieve
 */
const getPublicUrl = filename => `https://storage.googleapis.com/${bucketId}/${filename}`;

// Express middleware that will automatically create 4 image version
// and upload them to Google Storage
// req.file is processed and will have a new object property containing the storageObject for each version and the urls.
/*
  {
    storageObjects : {
      default : '',
      small: '',
      square:'',
      squareSmall:''
    },
    urls : {
      default : '',
      small: '',
      square:'',
      squareSmall:''
    }
  }
*/
// * ``storageObjects`` the object names in cloud storage.
// * ``publicUrls`` the public urls to the objects.

const uploadToGCS = (req, res, next) => {
    if (!req.file) {
        return next();
    }

    const imageOptions = {
        mimeTypes: ['image/jpeg', 'image/png'],
        maxSize: 10000,
        jpgQuality: 60,
        maxWidthHeight: 1600,
    };

    // Validate file type
    if (imageOptions.mimeTypes.indexOf(req.file.mimetype) < 0) {
        return res.status(400).send(`File type not allowed: ${req.file.mimetype}`);
    }

    // Validate file size
    if (req.file.size / 1024 > imageOptions.maxSize) {
        return res.status(400).send(`File size too big: ${req.file.size}`);
    }

    const imageData = {
        storageObjects: {},
        urls: {},
    };

    const fileName = parseFileName(req.file);
    // const fileType = req.file.mimetype === 'image/jpeg' ? 'jpg' : 'png';
    const buffer = req.file.buffer;
    const fileOptions = {
        mimetype: req.file.mimetype,
    };

    uploadFile(buffer, fileName, fileOptions, (err) => {
        if (err) {
            req.file.cloudStorageError = err;
            return next(err.message);
        }

        // We add the imageData object to our request body to save it later in the Datastore
        req.body.imageData = imageData;

        return next();
    });

    // lwip.open(buffer, fileType, (err, originalImage) => {
    //     const imgWidth = originalImage.width();
    //     const imgHeight = originalImage.height();

    //     async.parallel([
    //         (cb) => {
    //             createVersionAndUpload(originalImage, 'default', fileOptions, null, cb);
    //         },
    //         (cb) => {
    //             createVersionAndUpload(originalImage, 'small', fileOptions, { type: 'scale', size: [0.4, 0.4] }, cb);
    //         },
    //         (cb) => {
    //             const size = Math.min(imgWidth, imgHeight);
    //             createVersionAndUpload(originalImage, 'square', fileOptions, { type: 'crop', size: [size, size] }, cb);
    //         },
    //         (cb) => {
    //             const size = Math.min(imgWidth, imgHeight);
    //             createVersionAndUpload(originalImage, 'squareSmall', fileOptions, [
    //                 { type: 'crop', size: [size, size] },
    //                 { type: 'resize', size: [300, 300] },
    //             ], cb);
    //         },
    //     ], onAllImagesUploaded);
    // });

    // ----------

    /**
     * Parse the filename to retrieve the name and the extension.
     * This will allow us to create several version with different suffix.
     * Give the file a unique name with the current date, removing all white space
     * @param {Buffer} file -- the file being uploaded
     * @returns {object} -- An object with the name and the extension
     */
    function parseFileName(file) {
        const _fileName = {
            name: null,
            extension: null,
        };

        // Retrieve the file extension
        const reg = /(\.?[a-z0-9]+$)/i;
        const extension = reg.exec(file.originalname);

        if (extension.length > 0) {
            _fileName.extension = extension[0];
            _fileName.name = file.originalname.substring(0, extension.index);
            _fileName.name = `${Date.now()}-${S(_fileName.name).slugify().s}`;
        } else {
            _fileName.name = `${Date.now()}-${S(_fileName.name).slugify().s}`;
        }

        // return _fileName;
        return _fileName.extension ? _fileName.name + _fileName.extension : _fileNAme;
    }

    function createName(_fileName, sufix) {
        return _fileName.extension ? `${_fileName.name}-${sufix + _fileName.extension}` : `${_fileName.name}-${sufix}`;
    }

    function createVersionAndUpload(originalImage, type, options, operation, cb) {
        const filename = createName(fileName, type);

        if (operation === null) {
            originalImage.toBuffer('jpg', { quality: imageOptions.jpgQuality }, (err, newImage) => {
                uploadFile(newImage, filename, options, onUpload);
            });
        } else {
            if (!is.array(operation)) {
                operation = [operation];
            }
            originalImage.clone((err, imageCloned) => {
                const batch = imageCloned.batch();

                operation.forEach((op) => {
                    batch[op.type](op.size[0], op.size[1]);
                });

                batch.toBuffer('jpg', { quality: imageOptions.jpgQuality }, (err, newImage) => {
                    if (err) {
                        return cb(err);
                    }
                    uploadFile(newImage, filename, options, onUpload);
                });
            });
        }

        // ////////

        function onUpload(err, result) {
            if (err) {
                return cb(err);
            }

            // Add storageObject & publicUrl to imageData object
            imageData.storageObjects[type] = result.storageObject;
            imageData.urls[type] = result.url;

            cb(null);
        }
    }

    function uploadFile(buffer, fileName, options, cb) {
        const file = bucket.file(fileName);
        const stream = file.createWriteStream({
            metadata: {
                contentType: options.mimetype,
            },
            validation: 'crc32c',
        });

        stream.on('error', (err) => {
            cb(err);
        });

        stream.on('finish', () => {
            const result = {
                storageObject: fileName,
                url: getPublicUrl(fileName),
            };

            cb(null, result);
        });

        stream.end(buffer);
    }

    function onAllImagesUploaded(err) {
        if (err) {
            req.file.cloudStorageError = err;
            return next(err.message);
        }

        // We add the imageData object to our request body to save it later in the Datastore
        req.body.imageData = imageData;

        next();
    }
};
// [END process]

function deleteFromGCS(storageObjects, cb) {
    const fns = [];

    if (is.object(storageObjects)) {
        Object.keys(storageObjects).forEach((k) => {
            fns.push(processDelete(storageObjects[k]));
        });
    } else {
        fns.push(processDelete(storageObjects));
    }

    async.parallel(fns, (err) => {
        console.log('End Deleting Files GCS', err);
        if (err) {
            return cb(err);
        }
        cb(null);
    });

    // ----------

    function processDelete(fileName) {
        return function (cb) {
            console.log(`... Deleting GCS file ${fileName}`);
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
