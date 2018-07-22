'use strict';

const marked = require('marked');

module.exports = ({ logger }, { db, comment }) => {
  /**
   * For Demo Application only. Some BlogPost are protected and cannot be edited or delted
   */
  const protectedBlogPosts =
    (process.env.PROTECTED_BLOGPOSTS && process.env.PROTECTED_BLOGPOSTS.split(',')).map(id => +id.trim()) || [];

  /**
   * Get a list of BlogPosts
   * @param {*} options Object of options ("start" and "limit" parameters)
   */
  const getPosts = (options = {}) => db.getPosts(options);

  /**
   * Get a BlogPost
   * @param {*} id Id of the BlogPost to fetch
   * @param {*} dataloader optional. A Dataloader instance
   */
  const getPost = async (id, dataloader) => {
    id = +id;
    if (isNaN(id)) {
      throw new Error('BlogPost id must be an integer');
    }

    let post;
    try {
      post = await db.getPost(id, dataloader);
    } catch (err) {
      throw err;
    }

    if (post && post.content) {
      // Convert markdown to Html
      post.contentToHtml = marked(post.content);
    }

    return post;
  };

  /**
   * Create a BlogPost
   * @param {*} data BlogPost entity data
   * @param {*} dataloader optional Dataloader instance from the request
   */
  const createPost = (data, dataloader) => db.createPost(data, dataloader);

  /**
   * Update a BlogPost entity in the Datastore
   * @param {number} id Id of the BlogPost to update
   * @param {*} data BlogPost entity data
   * @param {Dataloader} dataloader optional Dataloader instance for the request
   * @param {boolean} overwrite optional overwrite the entity in Datastore (default false)
   */
  const updatePost = (id, data, dataloader, overwrite = false) => {
    id = +id;
    if (isNaN(id)) {
      throw new Error('BlogPost id must be an integer');
    }

    // This check if *only* for the Demo application deployed to prevent deleting the default posts
    if (protectedBlogPosts.indexOf(id) >= 0) {
      const err = new Error('This BlogPost can not be edited');
      err.status = 403;
      throw err;
    }

    return db.updatePost(id, data, dataloader, overwrite);
  };

  /**
   * Delete a BlogPost entity in the Datastore
   * @param {number} id Id of the BlogPost to delete
   */
  const deletePost = id => {
    id = +id;

    /**
     * This check if *only* for the Demo deployed application
     * to prevent deleting the default BlogPost
     */
    if (protectedBlogPosts.indexOf(id) >= 0) {
      const err = new Error('This BlogPost can not be deleted');
      err.status = 403;
      throw err;
    }

    return db.deletePost(id);
  };

  /**
   * This is only used for the Live demo application
   * to clean up generated BlogPost + comments and images every 24h
   */
  const cleanUp = async () => {
    const BlogPost = db.model;

    let posts;
    let ids;
    try {
      // Query by Key only which is faster and cheaper
      posts = await BlogPost.query()
        .select('__key__')
        .run({ format: 'JSON' });
      // retrieve list of IDs (filtering out the "default" post of the Demo application)
      ids = posts.entities.map(p => +p.id).filter(id => protectedBlogPosts.indexOf(id) < 0);
    } catch (e) {
      throw e;
    }

    const total = ids.length;

    // Delete BlogPosts (executing all the pre and post hooks)
    let result;
    try {
      result = await Promise.all(ids.map(id => BlogPost.delete(id, ['Blog', 'default'])));
    } catch (e) {
      throw e;
    }

    // Delete Comments of protected BlogPosts
    let comments;
    let commentsIds;
    try {
      comments = await Promise.all(
        protectedBlogPosts.map(id =>
          comment.commentDomain.queryDB
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
        logger.info(`Deleting ${commentsIds.length} comment(s) on protected BlogPost`);
        await comment.commentDomain.deleteComment(commentsIds);
      }
    } catch (e) {
      throw e;
    }

    if (total === 0) {
      return 'No BlogPost to clean up.';
    }
    return `${total} BlogPosts cleaned up.`;
  };

  return {
    getPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    cleanUp,
    protectedBlogPosts,
  };
};
