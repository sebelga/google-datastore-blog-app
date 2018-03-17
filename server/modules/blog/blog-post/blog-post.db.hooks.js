"use-strict";

const gstore = require("gstore-node")();
const R = require("ramda");

const imagesHelpers = require("../../../helpers/images");
const stringHelpers = require("../../../helpers/string");

/**
 * If the entity exists (it has an id) and we pass "null" as posterUri
 * or the entityData contains a "file", we fetch the entity to check if
 * it already has an feature image.
 * We use the Dataloader instance to fetch the entity.
 */
function deletePreviousImage() {
    if (!this.entityKey.id) {
        return Promise.resolve();
    }

    if (this.posterUri === null || typeof this.entityData.file !== "undefined") {
        return this.dataloader.load(this.entityKey).then(entity => {
            if (!entity || !entity.cloudStorageObject) {
                return;
            }
            return imagesHelpers.deleteFromGCS(entity.cloudStorageObject);
        });
    }

    return Promise.resolve();
}

/**
 * Initialize the entityData before saving it in the Datastore
 */
function initEntityData() {
    /**
     * Reminder: "compose" execute the pure functions from right --> left
     */
    this.entityData = R.compose(createExcerpt, sanitize, addCloudStorageData)(this.entityData);

    return Promise.resolve();
}

/**
 * If the entity has a "file" attached to it
 * we save its publicUrl (to posterUri) and cloudStorageObject information
 */
function addCloudStorageData(entityData) {
    if (entityData.file) {
        return {
            ...entityData,
            posterUri: entityData.file.cloudStoragePublicUrl || null,
            cloudStorageObject: entityData.file.cloudStorageObject || null
        };
    } else if (entityData.posterUri === null) {
        /**
         * Make sure that if the posterUri is null
         * the cloud storage object is also null
         */
        return { ...entityData, cloudStorageObject: null };
    }
    return entityData;
}

/**
 * Sanitize the entityData
 * This will remove all undeclared prop on our Schema
 */
function sanitize(entityData) {
    return gstore.model("BlogPost").sanitize(entityData);
}

/**
 * Generate the excerpt from the "content" value
 */
function createExcerpt(entityData) {
    return {
        ...entityData,
        excerpt: stringHelpers.createExcerpt(entityData.content)
    };
}

/**
 * Delete image from GCS before deleting a BlogPost
 */
function deleteFeatureImage() {
    // We fetch the entityData to see if there is a cloud storage object
    return this.datastoreEntity().then(entity => {
        if (!entity || !entity.cloudStorageObject) {
            return;
        }
        return imagesHelpers.deleteFromGCS(entity.cloudStorageObject);
    });
}

/**
 * Delete all the comments of a BlogPost after it has been deleted
 *
 * @param {*} key The key of the entity deleted
 */
function deleteComments({ key }) {
    const { id } = key;

    /**
     * A keys-only query returns just the keys of the result entities instead of
     * the entities data, at lower latency and cost.
     */
    return gstore
        .model("Comment")
        .query()
        .filter("blogPost", id)
        .select("__key__")
        .run()
        .then(({ entities }) => gstore.ds.delete(entities.map(entity => entity[gstore.ds.KEY])));
}

module.exports = schema => {
    /**
     * Hooks to run before *saving* the entity
     * In "pre.save" hooks, the scope "this" is the entity being saved
     * In "pre.delete" hooks, the scope is also the entity being deleted but does not have contain data.
     */
    schema.pre("save", [deletePreviousImage, initEntityData]);

    /**
     * Hooks to run before deleting the entity
     */
    schema.pre("delete", deleteFeatureImage);

    /**
     * Hooks to run after deleting the entity
     */
    schema.post("delete", deleteComments);
};
