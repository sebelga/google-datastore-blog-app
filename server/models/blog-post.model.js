'use strict';

var gstore = require('gstore-node')();
var Schema = gstore.Schema;

var imagesHelpers = require('../helpers/images');

let schema = new Schema({
    title :     {type:'string'},
    createdOn : {type:'datetime', default:new Date()},
    modifiedOn: {type:'datetime', default:new Date()},
    content:    {type:'string', excludeFromIndexes:true},
    excerpt:    {type:'string', excludeFromIndexes:true},
    imageData:  {type:'object'},
    cloudStorageObject: {type:'string'}
});

/**
 * Pre hook to delete image on GCS if we pass null for "imageData"
 */
schema.pre('save', function(next) {
    if (this.entityKey && this.get('imageData') === null) {
        var _this = this;
        // If entity exists (has an id) ---> Delete its image on GCS
        this.datastoreEntity(function(err, entity){
            if (entity && entity.get('imageData')) {
                imagesHelpers.deleteFromGCS(entity.get('imageData').storageObjects, function() {
                    if (err) return next(err);
                    _this.entityData.imageData = null;
                    next();
                });
            } else {
                next();
            }
        });
    } else {
        next();
    }
});


module.exports = gstore.model('BlogPost', schema);