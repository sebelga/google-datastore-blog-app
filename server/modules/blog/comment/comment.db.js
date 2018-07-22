'use strict';

const Joi = require('joi');
const moment = require('moment');

module.exports = ({ gstore }) => {
  /**
   * We will use "Joi" to validate this Schema
   */
  const schema = new gstore.Schema(
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
    return moment(this.createdOn).fromNow();
  });

  /**
   * Create a "Comment" Entity Kind Model passing our schema
   */
  const Comment = gstore.model('Comment', schema);

  /**
   * DB API
   */
  return {
    getComments(postId, options = { limit: 3 }) {
      const query = Comment.query()
        .filter('blogPost', postId)
        .order('createdOn', { descending: true })
        .limit(options.limit);

      if (options.start) {
        query.start(options.start);
      }

      return query.run({ format: 'ENTITY' }).then(result => {
        // Add virtual properties to the entities
        const entities = result.entities.map(entity => entity.plain({ virtuals: options.withVirtuals }));
        return { entities, nextPageCursor: result.nextPageCursor };
      });
    },
    createComment(data) {
      const entityData = Comment.sanitize(data);
      const comment = new Comment(entityData);
      return comment.save();
    },
    deleteComment(id) {
      return Comment.delete(id);
    },
    query: Comment.query,
  };
};
