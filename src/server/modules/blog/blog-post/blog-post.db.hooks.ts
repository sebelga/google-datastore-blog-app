'use-strict';

import R from 'ramda';
import { DatastoreKey } from '@google-cloud/datastore/entity';
import { Entity } from 'gstore-node';
import { Context, Modules } from '../models';
import { BlogPostType } from './models';

export default ({ gstore }: Context, { images, utils }: Modules) => {
  /**
   * If the entity exists (it has an id) and we pass "null" as posterUri
   * or the entityData contains a "file", we fetch the entity to check if
   * it already has an feature image.
   * We use the Dataloader instance to fetch the entity.
   */
  function deletePreviousImage(): Promise<any> {
    if (!this.entityKey.id) {
      return Promise.resolve();
    }

    if (this.posterUri === null || typeof this.entityData.file !== 'undefined') {
      const dataloader = this.dataloader ? this.dataloader : this.context && this.context.dataloader;

      return dataloader.load(this.entityKey).then((entity: Entity<BlogPostType>) => {
        if (!entity || !entity.cloudStorageObject) {
          return;
        }
        return images.deleteFromGCS(entity.cloudStorageObject);
      });
    }

    return Promise.resolve();
  }

  /**
   * Initialize the entityData before saving it in the Datastore
   */
  function initEntityData(): Promise<any> {
    /**
     * Reminder: "compose" execute the functions from right --> left
     */
    this.entityData = R.compose(
      createExcerpt,
      sanitize,
      addCloudStorageData
    )(this.entityData);

    return Promise.resolve();
  }

  /**
   * If the entity has a "file" attached to it
   * we save its publicUrl (to posterUri) and cloudStorageObject information
   */
  function addCloudStorageData(entityData: any) {
    if (entityData.file) {
      return {
        ...entityData,
        posterUri: entityData.file.cloudStoragePublicUrl || null,
        cloudStorageObject: entityData.file.cloudStorageObject || null,
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
  function sanitize(entityData: any) {
    return gstore.model('BlogPost').sanitize(entityData);
  }

  /**
   * Generate the excerpt from the "content" value
   */
  function createExcerpt(entityData: any) {
    return {
      ...entityData,
      excerpt: utils.string.createExcerpt(entityData.content),
    };
  }

  /**
   * Delete image from GCS before deleting a BlogPost
   */
  function deleteFeatureImage() {
    // We fetch the entityData to see if there is a cloud storage object
    return this.datastoreEntity().then((entity: Entity<BlogPostType>) => {
      if (!entity || !entity.cloudStorageObject) {
        return;
      }
      return images.deleteFromGCS(entity.cloudStorageObject);
    });
  }

  /**
   * Delete all the comments of a BlogPost after it has been deleted
   *
   * @param {*} key The key of the entity deleted
   */
  function deleteComments({ key }: { key: DatastoreKey }) {
    const { id } = key;

    /**
     * A keys-only query returns just the keys of the result entities instead of
     * the entities data, at lower latency and cost.
     */
    return gstore
      .model('Comment')
      .query()
      .filter('blogPost', id)
      .select('__key__')
      .run()
      .then(({ entities }) => gstore.ds.delete(entities.map(entity => entity[gstore.ds.KEY])));
  }

  return {
    deletePreviousImage,
    initEntityData,
    deleteFeatureImage,
    deleteComments,
  };
};
