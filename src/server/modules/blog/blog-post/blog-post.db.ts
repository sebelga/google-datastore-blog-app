import { Entity, QueryListOptions, QueryResult, DeleteResult, Query } from 'gstore-node';
import { Context, Modules } from '../models';
import { BlogPostType } from './models';

type FunctionReturnPromise = (...args: any[]) => Promise<any>;

export interface BlogPostDB {
  getPosts(options?: QueryListOptions): Promise<QueryResult<BlogPostType>>;
  getPost(id: number, dataloader: any, format?: string): Promise<Entity<BlogPostType> | BlogPostType>;
  createPost(data: BlogPostType, dataloader: any): Promise<Entity<BlogPostType>>;
  updatePost(id: number, data: any, dataloader: any, replace: boolean): Promise<Entity<BlogPostType>>;
  deletePost(id: number): Promise<DeleteResult>;
  addPreSaveHook(handler: FunctionReturnPromise | FunctionReturnPromise[]): void;
  addPreDeleteHook(handler: FunctionReturnPromise | FunctionReturnPromise[]): void;
  addPostDeleteHook(handler: FunctionReturnPromise | FunctionReturnPromise[]): void;
  query(): Query<BlogPostType>;
}

export default (context: Context, modules: Modules): BlogPostDB => {
  const { gstore, logger } = context;
  const { Schema } = gstore;
  const { utils } = modules;

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
   * All the BlogPost will be created under the same entity group with ancestor ["Blog", "default"]
   * The ancestor entity does not have to exist in the Datastore to be able to create the children.
   * Saving our BlogPost in one entity group will give us *strong consistency* when saving entities
   */
  const ancestor = ['Blog', 'default'];

  const { addPreSaveHook, addPreDeleteHook, addPostDeleteHook } = utils.gstore.initDynamicHooks(schema, logger);

  /**
   * Define default configuration for our Model.list() query shortcut
   */
  schema.queries('list', {
    order: { property: 'modifiedOn', descending: true },
    ancestors: ancestor,
  });

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
    addPreSaveHook,
    addPreDeleteHook,
    addPostDeleteHook,
    query: BlogPost.query,
  };
};
