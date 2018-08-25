import path from 'path';
import { Request, Response } from 'express';
import { Entity, QueryResult, DeleteResult } from 'gstore-node';
import { BlogPostType } from './models';
import { Context, Modules } from '../models';

export interface BlogPostRoutesHandlers {
  listPosts(req: Request, res: Response): any;
  detailPost(req: Request, res: Response): any;
  deletePost(req: Request, res: Response): any;
  cleanUp(req: Request, res: Response): any;
}

export default ({ gstore, logger }: Context, { blogPostDomain }: Modules): BlogPostRoutesHandlers => {
  return {
    async listPosts(_, res) {
      const template = 'blog/index';
      let posts: QueryResult<BlogPostType>;

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
    },
    async detailPost(req, res) {
      /**
       * Create Dataloader instance, unique to this http Request
       */
      const dataloader = gstore.createDataLoader();
      const template = 'blog/detail';

      let post: Entity<BlogPostType>;
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
    },
    async deletePost(req, res) {
      let result: DeleteResult;

      try {
        result = await blogPostDomain.deletePost(req.params.id);
      } catch (err) {
        return res.status(err.status || 401).end(err.message);
      }

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json(result);
    },
    /**
     * FOR LIVE DEMO APPLICATION: Clean up BlogPost created by users
     * This function is executed every 24h by a Cron Job
     */
    async cleanUp(_, res) {
      logger.info('Cleaning up BlogPost...');

      let result;
      try {
        result = await blogPostDomain.cleanUp();
        logger.info('---------  CLEAN UP FINISHED --------');
        logger.info(result);
        logger.info('-------------------------------------');

        res.send('ok');
      } catch (err) {
        logger.error(err.message);
        res.status(400).send(err);
      }
    },
  };
};
