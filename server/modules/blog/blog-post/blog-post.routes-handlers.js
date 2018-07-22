'use strict';

const path = require('path');

const templatesDir = path.join(__dirname, '..', 'views');

module.exports = ({ gstore, logger }, { blogPostDomain }) => {
  const listPosts = async (_, res) => {
    const template = path.join(templatesDir, 'index');
    let posts;

    try {
      posts = await blogPostDomain.getPosts();
    } catch (error) {
      return res.render(template, {
        blogPosts: [],
        error,
      });
    }

    res.render(template, {
      blogPosts: posts.entities,
      pageId: 'home',
    });
  };

  const detailPost = async (req, res) => {
    /**
     * Create Dataloader instance, unique to this http Request
     */
    const dataloader = gstore.createDataLoader();
    const template = path.join(templatesDir, 'detail');

    let post;
    try {
      post = await blogPostDomain.getPost(req.params.id, dataloader);
    } catch (error) {
      if (error.code === 'ERR_ENTITY_NOT_FOUND') {
        return res.redirect('/404');
      }
      return res.render(template, { post: null, error });
    }

    return res.render(template, {
      pageId: 'blogpost-view',
      post,
    });
  };

  const deletePost = async (req, res) => {
    let result;

    try {
      result = await blogPostDomain.deletePost(req.params.id);
    } catch (err) {
      return res.status(err.status || 401).end(err.message);
    }

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  };

  /**
   * Clean up BlogPost created by users of the Live Demo
   * Executed every 24h by a Cron Job
   */
  const cleanUp = async (req, res) => {
    logger.info('Cleaning up BlogPost...');

    let result;
    try {
      result = await blogPostDomain.cleanUp();
    } catch (err) {
      res.status(400).send(err);
    }

    logger.info('---------  CLEAN UP FINISHED --------');
    logger.info(result);
    logger.info('-------------------------------------');

    res.send('ok');
  };

  return {
    listPosts,
    detailPost,
    deletePost,
    cleanUp,
  };
};
