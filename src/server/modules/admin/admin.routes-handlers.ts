import is from 'is';
import { Request, Response } from 'express';
import { Context, Modules } from './models';

export interface AdminRoutesHandlers {
  dashboard(req: Request, res: Response): any;
  createPost(req: Request, res: Response): any;
  editPost(req: Request, res: Response): any;
}

export default ({ gstore }: Context, { blog }: Modules): AdminRoutesHandlers => {
  const { blogPostDomain } = blog.blogPost;
  const { protectedBlogPosts } = blogPostDomain;

  return {
    async dashboard(req, res) {
      const template = 'admin/dashboard';

      let posts;
      try {
        posts = await blogPostDomain.getPosts({
          cache: req.query.cache !== 'false',
        });
      } catch (error) {
        return res.render(template, {
          error,
          pageId: 'admin-index',
        });
      }

      res.render(template, {
        posts: posts.entities,
        pageId: 'admin-index',
        protectedBlogPosts: protectedBlogPosts.join(','),
      });
    },
    async createPost(req, res) {
      const template = 'admin/edit';
      const dataloader = gstore.createDataLoader();

      if (req.method === 'POST') {
        const entityData = Object.assign({}, req.body, { file: req.file });

        try {
          await blogPostDomain.createPost(entityData, dataloader);
        } catch (err) {
          return res.render(template, {
            blogPost: entityData,
            error: is.object(err.message) ? err.message : err,
          });
        }

        return res.redirect('/admin?cache=false');
      }

      return res.render(template, {
        pageId: 'blogpost-edit',
      });
    },
    async editPost(req, res) {
      const template = 'admin/edit';
      const pageId = 'blogpost-edit';
      const dataloader = gstore.createDataLoader();
      const { id } = req.params;

      if (req.method === 'POST') {
        const entityData = Object.assign({}, req.body, { file: req.file });

        try {
          await blogPostDomain.updatePost(id, entityData, dataloader, true);
        } catch (err) {
          return res.render(template, {
            post: Object.assign({}, entityData, { id }),
            pageId,
            error: is.object(err.message) ? err.message : err,
            protectedBlogPosts: protectedBlogPosts.join(','),
          });
        }

        return res.redirect('/admin?cache=false');
      }

      let post;
      try {
        post = await blogPostDomain.getPost(id, dataloader);
      } catch (err) {
        return res.render(template, {
          post: {},
          pageId,
          error: is.object(err.message) ? err.message : err,
          protectedBlogPosts: protectedBlogPosts.join(','),
        });
      }

      if (!post) {
        return res.redirect('/404');
      }

      res.render(template, {
        post,
        pageId,
        protectedBlogPosts: protectedBlogPosts.join(','),
      });
    },
  };
};
