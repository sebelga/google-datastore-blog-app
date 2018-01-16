'use strict';

const gstore = require('gstore-node')();
const imagesHelpers = require('../helpers/images');

const Schema = gstore.Schema;
const schema = new Schema({
    title: { type: 'string' },
    createdOn: { type: 'datetime', default: new Date() },
    modifiedOn: { type: 'datetime', default: gstore.defaultValues.NOW },
    content: { type: 'string', excludeFromIndexes: true },
    excerpt: { type: 'string', excludeFromIndexes: true },
    posterUri: { type: 'string' },
    cloudStorageObject: { type: 'string' },
});

/**
 * Configuration of the "list" queries shortcut
 */
schema.queries('list', {
    order: { property: 'modifiedOn', descending: true },
});

/**
 * Hook to delete image from GCS when we delete a post
 */
schema.pre('delete', function() {
    if (!this.cloudStorageObject) {
        return Promise.resolve();
    }
    return imagesHelpers.deleteFromGCS(this.cloudStorageObject);
});

 /**
 * Hook to delete image from GCS if we pass null for "imageData"
 */
// schema.pre('save', function (next) {
//     if (this.entityKey && this.get('imageData') === null) {
//         let _this = this;
//         // If entity exists (has an id) ---> Delete its image on GCS
//         this.datastoreEntity((err, entity) =>  {
//             if (entity && entity.get('imageData')) {
//                 imagesHelpers.deleteFromGCS(entity.get('imageData').storageObjects, () => {
//                     if (err) return next(err);
//                     _this.entityData.imageData = null;
//                     next();
//                 });
//             } else {
//                 next();
//             }
//         });
//     } else {
//         next();
//     }
// });


module.exports = gstore.model('BlogPost', schema);
