import { Request, Response } from 'express';
import { Context, Modules } from '../models';

export interface CommentRoutes {
  getComments(req: Request, res: Response): any;
  createComment(req: Request, res: Response): any;
  deleteComment(req: Request, res: Response): any;
}

export default (_: Context, { commentDomain }: Modules): CommentRoutes => {
  const getComments = async (req: Request, res: Response) => {
    const postId = req.params.id;
    let result;
    try {
      result = await commentDomain.getComments(postId, {
        start: req.query.start,
        limit: 3,
        withVirtuals: true,
      });
    } catch (err) {
      return res.status(400).json(err);
    }

    res.json(result);
  };

  const createComment = async (req: Request, res: Response) => {
    const postId = req.params.id;
    let comment;
    try {
      comment = await commentDomain.createComment(postId, req.body);
    } catch (err) {
      return res.status(400).json(err);
    }

    res.json(comment);
  };

  const deleteComment = async (req: Request, res: Response) => {
    const commentId = req.params.id;
    let result;
    try {
      result = await commentDomain.deleteComment(commentId);
    } catch (err) {
      return res.status(400).json(err);
    }

    res.send(result);
  };

  return {
    getComments,
    createComment,
    deleteComment,
  };
};
