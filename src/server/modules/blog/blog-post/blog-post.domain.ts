import marked from 'marked';
import Boom from 'boom';
import initDBhooks from './blog-post.db.hooks';
import { Entity, QueryListOptions, QueryResult, DeleteResult } from 'gstore-node';
import { Context, Modules } from '../models';
import { BlogPostType } from './models';
import { CommentType } from '../comment';

export interface BlogPostDomain {
  getPosts(options?: QueryListOptions): Promise<QueryResult<BlogPostType>>;
  getPost(id: number | string, dataLoader: any): Promise<Entity<BlogPostType>>;
  createPost(data: BlogPostType, dataLoader: any): Promise<Entity<BlogPostType>>;
  updatePost(
    id: string | number,
    data: BlogPostType,
    dataloader: any,
    overwrite?: boolean
  ): Promise<Entity<BlogPostType>>;
  deletePost(id: string | number): Promise<DeleteResult>;
  cleanUp(): Promise<string>;
  protectedBlogPosts: number[];
}

export default (context: Context, { blogPostDB, images, utils, comment }: Modules): BlogPostDomain => {
  /**
   * For Demo Application only. Some BlogPost are protected and cannot be edited or delted
   */
  const protectedBlogPosts = process.env.PROTECTED_BLOGPOSTS
    ? process.env.PROTECTED_BLOGPOSTS.split(',').map(id => +id.trim())
    : [];

  /**
   * Add "pre" and "post" hooks to our Schema
   */
  const { initEntityData, deletePreviousImage, deleteFeatureImage, deleteComments } = initDBhooks(context, {
    images,
    utils,
    comment,
  });
  blogPostDB.addPreSaveHook([deletePreviousImage, initEntityData]);
  blogPostDB.addPreDeleteHook(deleteFeatureImage);
  blogPostDB.addPostDeleteHook(deleteComments);

  return {
    /**
     * Get a list of BlogPosts
     * @param {*} options Object of options ("start" and "limit" parameters)
     */
    getPosts(options = {}) {
      return blogPostDB.getPosts(options);
    },
    /**
     * Get a BlogPost
     * @param {*} id Id of the BlogPost to fetch
     * @param {*} dataloader optional. A Dataloader instance
     */
    async getPost(id, dataloader) {
      id = +id;
      if (isNaN(id)) {
        throw new Error('BlogPost id must be an integer');
      }

      let post: Entity<BlogPostType>;
      try {
        post = <Entity<BlogPostType>>await blogPostDB.getPost(id, dataloader);
      } catch (err) {
        throw err;
      }

      if (post && post.content) {
        // Convert markdown to Html
        post.contentToHtml = marked(post.content);
      }

      return post;
    },
    /**
     * Create a BlogPost
     * @param {*} data BlogPost entity data
     * @param {*} dataloader optional Dataloader instance from the request
     */
    createPost(data: BlogPostType, dataloader: any) {
      return blogPostDB.createPost(data, dataloader);
    },
    /**
     * Update a BlogPost entity in the Datastore
     * @param {number} id Id of the BlogPost to update
     * @param {*} data BlogPost entity data
     * @param {Dataloader} dataloader optional Dataloader instance for the request
     * @param {boolean} overwrite optional overwrite the entity in Datastore (default false)
     */
    updatePost(id, data, dataloader, overwrite = false) {
      id = +id;
      if (isNaN(id)) {
        throw new Boom('BlogPost id must be an integer', { statusCode: 400 });
      }

      // This is only for the Live demo application to prevent deleting the "default" posts
      if (protectedBlogPosts.indexOf(id) >= 0) {
        throw new Boom('This BlogPost can not be edited', { statusCode: 403 });
      }

      return blogPostDB.updatePost(id, data, dataloader, overwrite);
    },
    /**
     * Delete a BlogPost entity in the Datastore
     * @param {number} id Id of the BlogPost to delete
     */
    deletePost(id) {
      return blogPostDB.deletePost(+id);
    },
    /**
     * ONLY FOR THE LIVE DEMO APPLICATION
     * Clean up user generated BlogPost + comments and images in a Cron Job every 24h
     */
    async cleanUp() {
      let posts;
      let ids;
      try {
        /**
         * Query and ask only for the entity keys, which is faster and cheaper
         */
        posts = await blogPostDB
          .query()
          .select('__key__')
          .run();
        /**
         * Retrieve a list of IDs (filtering out the "default" post of the Demo application)
         */
        ids = posts.entities.map(p => +p.id).filter(id => !protectedBlogPosts.includes(id));
      } catch (e) {
        throw e;
      }

      const total = ids.length;

      /**
       * Delete BlogPosts (executing all the pre and post hooks)
       */
      try {
        await Promise.all(ids.map(id => blogPostDB.deletePost(id)));
      } catch (e) {
        throw e;
      }

      /**
       * Delete Comments of protected BlogPosts
       */
      let comments: QueryResult<CommentType>[];
      let commentsIds: number[];
      try {
        comments = await Promise.all(
          protectedBlogPosts.map(id =>
            comment.commentDB
              .query()
              .filter('blogPost', id)
              .select('__key__')
              .run()
          )
        );

        commentsIds = comments.reduce((acc, blogComments) => {
          blogComments.entities.forEach(e => acc.push(+e.id));
          return acc;
        }, []);

        if (commentsIds.length > 0) {
          context.logger.info(`Deleting ${commentsIds.length} comment(s) on protected BlogPost`);
          await comment.commentDomain.deleteComment(commentsIds);
        }
      } catch (e) {
        throw e;
      }

      if (total === 0) {
        return 'No BlogPost to clean up.';
      }
      return `${total} BlogPosts cleaned up.`;
    },
    protectedBlogPosts,
  };
};
