'use strict';

import { Entity, Model, QueryListOptions, QueryResult, DeleteResult } from 'gstore-node';
import initDBhooks from './blog-post.db.hooks';
import { Context, Modules } from '../models';
import { BlogPostType } from './models';

export interface BlogPostDB {
  getPosts(options?: QueryListOptions): Promise<QueryResult<BlogPostType>>;
  getPost(id: number, dataloader: any, format?: string): Promise<Entity<BlogPostType> | BlogPostType>;
  createPost(data: BlogPostType, dataloader: any): Promise<Entity<BlogPostType>>;
  updatePost(id: number, data: any, dataloader: any, replace: boolean): Promise<Entity<BlogPostType>>;
  deletePost(id: number): Promise<DeleteResult>;
  gstoreModel: Model<BlogPostType>;
}

export default (context: Context, { images, utils }: Modules): BlogPostDB => {
  const { gstore } = context;
  const { Schema } = gstore;

  /**
   * Schema for the BlogPost entity Kind
   */
  const schema = new Schema<BlogPostType>({
    title: { type: String },
    createdOn: {
      type: Date,
      default: gstore.defaultValues.NOW,
      read: false,
      write: false,
    },
    modifiedOn: { type: Date, default: gstore.defaultValues.NOW },
    content: { type: String, excludeFromIndexes: true },
    excerpt: { type: String, excludeFromIndexes: true },
    posterUri: { type: String },
    cloudStorageObject: { type: String },
  });

  /**
   * Add "pre" and "post" hooks to our Schema
   */
  const { deletePreviousImage, initEntityData, deleteFeatureImage, deleteComments } = initDBhooks(context, {
    images,
    utils,
  });

  /**
   * Hooks to run before *saving* the entity
   * In "pre.save" hooks, the scope "this" is the entity being saved
   * In "pre.delete" hooks, the scope is also the entity being deleted but does not have contain data.
   */
  schema.pre('save', [deletePreviousImage, initEntityData]);

  /**
   * Hooks to run before deleting the entity
   */
  schema.pre('delete', deleteFeatureImage);

  /**
   * Hooks to run after deleting the entity
   */
  schema.post('delete', deleteComments);

  /**
   * Define default configuration for our Model.list() query shortcut
   */
  schema.queries('list', {
    order: { property: 'modifiedOn', descending: true },
    ancestors: ['Blog', 'default'],
  });

  /**
   * All the BlogPost will be created under the same entity group with ancestor ["Blog", "default"]
   * The ancestor entity does not have to exist in the Datastore to be able to create the children.
   * Saving our BlogPost in one entity group will give us *strong consistency* when saving entities
   */
  const ancestor = ['Blog', 'default'];

  /**
   * Create a "BlogPost" Entity Kind Model
   */
  const BlogPost = gstore.model('BlogPost', schema);

  /**
   * DB API
   */
  return {
    getPosts: BlogPost.list.bind(BlogPost),
    getPost(id, dataloader, format = 'JSON') {
      return BlogPost.get(id, ancestor, null, null, { dataloader }).then(entity => {
        if (format === 'JSON') {
          // Transform the gstore "Entity" instance
          // to a plain object (adding an "id" prop to it)
          return entity.plain();
        }
        return entity;
      });
    },
    createPost(data, dataloader) {
      const post = new BlogPost(data, null, ancestor);

      // We add the DataLoader instance to our entity context
      // so it is available in our "pre" Hooks
      post.context.dataloader = dataloader;
      return post.save();
    },
    updatePost(id, data, dataloader, replace) {
      return BlogPost.update(id, data, ancestor, null, null, { dataloader, replace });
    },
    deletePost(id) {
      return BlogPost.delete(id, ancestor);
    },
    gstoreModel: BlogPost,
  };
};
