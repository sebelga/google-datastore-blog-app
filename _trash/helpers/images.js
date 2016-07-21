
'use strict';

var async  = require('async');
var config = require('../config');
var S      = require('string');
var is     = require('is');
var lwip   = require('lwip');

var CLOUD_BUCKET = config.get('CLOUD_BUCKET');

var storage = require('@google-cloud/storage')({
  projectId: config.get('GCLOUD_PROJECT')
});
var bucket = storage.bucket(CLOUD_BUCKET);

// Returns the public, anonymously accessable URL to a given Cloud Storage
// object.
// The object's ACL has to be set to public read.
// [START public_url]
function getPublicUrl (filename) {
  return 'https://storage.googleapis.com/' + CLOUD_BUCKET + '/' + filename;
}
// [END public_url]

// Express middleware that will automatically create 4 image version
// and upload them to Google Storage
// req.file is processed and will have a new object property
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
// [START process]
function sendUploadToGCS (req, res, next) {
  if (!req.file) {
    return next();
  }

  var imageOptions = {
      mimeTypes:      ['image/jpeg', 'image/png'],
      maxSize:        10000,
      jpgQuality:     60,
      maxWidthHeight: 1600
  };

  // Validate file type
  if (imageOptions.mimeTypes.indexOf(req.file.mimetype) < 0) {
      res.status(400).send('File type not allowed: ' + req.file.mimetype);
  }

  // Validate file size
  if (req.file.size * 1000 / 1024000 > imageOptions.maxSize) {
      res.status(400).send('File size too big: ' + req.file.size);
  }

  var imageData = {
    storageObjects : {},
    urls : {}
  };

  var fileName = parseFileName(req.file);
  var fileType = req.file.mimetype === 'image/jpeg' ? 'jpg': 'png';
  var buffer   = req.file.buffer;
  var fileOptions = {
    mimetype:req.file.mimetype
  };

  lwip.open(buffer, fileType, function (err, originalImage){
    let imgWidth  = originalImage.width();
    let imgHeight = originalImage.height();

    async.parallel([
      function(cb) {
        createVersionAndUpload(originalImage, 'default', fileOptions, null, cb);
      },
      function (cb) {
        createVersionAndUpload(originalImage, 'small', fileOptions, {type:'scale', size:[0.4, 0.4]}, cb);
      },
      function (cb) {
        var size = Math.min(imgWidth, imgHeight);
        createVersionAndUpload(originalImage, 'square', fileOptions, {type:'crop', size:[size, size]}, cb);
      },
      function (cb) {
        var size = Math.min(imgWidth, imgHeight);
        createVersionAndUpload(originalImage, 'squareSmall', fileOptions, [{type:'crop', size:[size, size]}, {type:'resize', size:[300, 300]}], cb);
      }
    ], onAllImagesUploaded);
  });

  //////////

  function parseFileName(file) {
    var fileName = {
      name : null,
      extension : null
    };

    var reg    = /(\.?[a-z0-9]+$)/i;
    var result = reg.exec(file.originalname);

    if (result.length > 0) {
      fileName.extension = result[0];
      fileName.name      = file.originalname.substring(0, result.index);
      fileName.name      = Date.now() + '-' + S(fileName.name).slugify().s;
    } else {
      fileName.name = Date.now() + S(file.originalname).slugify().s;
    }

    return fileName;
  }

  function createName(fileName, sufix) {
    var n = fileName.name + '-' + sufix;
    if (fileName.extension) {
      n += fileName.extension;
    }
    return n;
  }

  function createVersionAndUpload(originalImage, type, options, operation, cb) {
    var filename = createName(fileName, type);

    if (operation === null) {
      originalImage.toBuffer('jpg', {quality:imageOptions.jpgQuality}, function(err, newImage) {
        uploadFile(newImage, filename, options, onUpload);
      });
    } else {
      if (!is.array(operation)) {
        operation = [operation];
      }
      originalImage.clone(function (err, imageCloned){
        let batch = imageCloned.batch();

        operation.forEach((op) => {
          batch[op.type](op.size[0], op.size[1]);
        });

        batch.toBuffer('jpg', {quality:imageOptions.jpgQuality}, function(err, newImage) {
                if (err) {
                  return cb(err);
                }
                uploadFile(newImage, filename, options, onUpload);
            });
      });
    }

    //////////

    function onUpload(err, result) {
      if (err) {
        return cb(err);
      }

      // Add storageObject & publicUrl to imageData object
      imageData.storageObjects[type] = result.storageObject;
      imageData.urls[type]           = result.url;

      cb(null);
    }
  }

  function uploadFile(buffer, fileName, options, cb) {
    var file     = bucket.file(fileName);
    var stream   = file.createWriteStream({
      metadata: {
        contentType: options.mimetype
      },
      validation : 'crc32c'
    });

    stream.on('error', function (err) {
      cb(err);
    });

    stream.on('finish', function () {
      let result = {
        storageObject: fileName,
        url:     getPublicUrl(fileName)
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
}
// [END process]

function deleteFromGCS(storageObjects, cb) {
  let fns = [];

  if (is.object(storageObjects)) {
    Object.keys(storageObjects).forEach((k) => {
      fns.push(fnDelete(storageObjects[k]));
    });
  } else {
    fns.push(fnDelete(storageObjects))
  }

  async.parallel(fns, function(err) {
    console.log('End Deleting Files GCS', err);
    if (err) {
      return cb(err);
    }
    cb(null);
  });

  //////////

  function fnDelete(fileName) {
    return function(cb) {
      console.log('... Deleting GCS file ' + fileName);
      let file = bucket.file(fileName);

      file.delete(function(err, apiResponse) {
        if (err && err.code !== 404) {
          return cb(err);
        }
        cb(null);
      });
    }
  }
}

// Multer handles parsing multipart/form-data requests.
// This instance is configured to store images in memory and re-name to avoid
// conflicting with existing objects. This makes it straightforward to upload
// to Cloud Storage.
// [START multer]
var multer = require('multer')({
  inMemory: true,
  fileSize: 5 * 1024 * 1024, // no larger than 5mb
  rename: function (fieldname, filename) {
    // generate a unique filename
    return filename.replace(/\W+/g, '-').toLowerCase() + Date.now();
  }
});
// [END multer]

module.exports = {
  getPublicUrl: getPublicUrl,
  sendUploadToGCS: sendUploadToGCS,
  deleteFromGCS: deleteFromGCS,
  multer: multer
};