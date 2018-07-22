'use strict';

const dbHooks = require('./blog-post.db.hooks');

module.exports = (context, { images }) => {
  const { gstore } = context;
  const { Schema } = gstore;

  /**
   * Schema for the BlogPost entity Kind
   */
  const schema = new Schema({
    title: { type: 'string' },
    createdOn: {
      type: 'datetime',
      default: gstore.defaultValues.NOW,
      read: false,
      write: false,
    },
    modifiedOn: { type: 'datetime', default: gstore.defaultValues.NOW },
    content: { type: 'string', excludeFromIndexes: true },
    excerpt: { type: 'string', excludeFromIndexes: true },
    posterUri: { type: 'string' },
    cloudStorageObject: { type: 'string' },
  });

  /**
   * Add "pre" and "post" hooks to our Schema
   */
  const { deletePreviousImage, initEntityData, deleteFeatureImage, deleteComments } = dbHooks(context, { images });

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

      // We add the DataLoader instance to our entity
      // so it is available in our "pre" Hooks
      post.dataloader = dataloader;
      return post.save();
    },
    updatePost(id, data, dataloader, replace) {
      return BlogPost.update(id, data, ancestor, null, null, { dataloader, replace });
    },
    deletePost(id) {
      return BlogPost.delete(id, ancestor);
    },
    model: BlogPost,
  };
};
