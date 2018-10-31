import Joi from 'joi';
import distanceInWords from 'date-fns/distance_in_words';
import { Entity, Query, QueryListOptions } from 'gstore-node';

import { Context } from '../models';
import { CommentType } from './models';

export interface CommentDB {
  getComments(postId: number | string, options?: QueryListOptions & { withVirtuals?: boolean }): Promise<any>;
  createComment(data: CommentType): Promise<CommentType>;
  deleteComment(id: number | string | (number | string)[]): Promise<any>;
  deletePostComment(postId: number): Promise<any>;
  query(): Query<CommentType>;
}

export default ({ gstore }: Context): CommentDB => {
  const { Schema } = gstore;

  /**
   * We use "Joi" to validate this Schema
   */
  const schema = new Schema<CommentType>(
    {
      blogPost: { joi: Joi.number() },
      createdOn: {
        joi: Joi.date().default(() => new Date(), 'Current datetime of request'),
        write: false,
      },
      // user name must have minimum 3 characters
      name: { joi: Joi.string().min(3) },
      // comment must have minimum 10 characters
      comment: { joi: Joi.string().min(10), excludeFromIndexes: true },
      website: {
        joi: Joi.string()
          .uri() // validate url
          .allow(null),
      },
    },
    { joi: true } // tell gstore that we will validate with Joi
  );

  /**
   * We add a virtual property "createdOnFormatted" (not persisted in the Datastore)
   * to display the date of the comment in our View
   */
  schema.virtual('createdOnFormatted').get(function getCreatedOnFormatted() {
    return `${distanceInWords(new Date(), new Date(this.createdOn))} ago`;
  });

  /**
   * Create a "Comment" Entity Kind Model passing our schema
   */
  const Comment = gstore.model('Comment', schema);

  /**
   * DB API
   */
  return {
    async getComments(postId, options = { limit: 3 }) {
      const query = Comment.query()
        .filter('blogPost', postId)
        .order('createdOn', { descending: true })
        .limit(options.limit);

      if (options.start) {
        query.start(options.start);
      }

      const { entities, nextPageCursor } = await query.run({ format: 'ENTITY' });

      return {
        entities: (<Entity<CommentType>[]>entities).map(entity =>
          // Return Json with virtual properties
          entity.plain({ virtuals: !!options.withVirtuals })
        ),
        nextPageCursor,
      };
    },
    async createComment(data) {
      const entityData = Comment.sanitize(data);
      const comment = new Comment(entityData);
      const entity = await comment.save();

      return entity.plain({ virtuals: true });
    },
    deleteComment(id) {
      return Comment.delete(id);
    },
    async deletePostComment(postId) {
      /**
       * A keys-only query returns just the keys of the entities instead of the entities data,
       * at lower latency and cost.
       */
      const { entities } = await Comment.query()
        .filter('blogPost', postId)
        .select('__key__')
        .run();

      const keys = (entities as Array<any>).map(entity => entity[gstore.ds.KEY]);

      /**
       * Use @google-cloud/datastore delete() APi to delete the keys
       * Info: gstore.ds ==> alias to the underlying "datastore" instance
       */
      return gstore.ds.delete(keys);
    },
    query: Comment.query,
  };
};
