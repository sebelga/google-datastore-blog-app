import { QueryListOptions } from 'gstore-node';

import { CommentType } from './models';
import { Context, Modules } from '../models';

export interface CommentDomain {
  getComments(postId: number | string, options?: QueryListOptions & { withVirtuals?: boolean }): Promise<any>;
  createComment(postId: number | string, data: CommentType): Promise<CommentType>;
  deleteComment(id: number | string | (number | string)[]): Promise<any>;
}

export default (_: Context, { commentDB }: Modules): CommentDomain => {
  const getComments = (postId: number | string, options: QueryListOptions & { withVirtuals?: boolean }) => {
    postId = +postId;

    if (options.start) {
      options.start = decodeURIComponent(options.start);
    }

    return commentDB.getComments(postId, options);
  };

  const createComment = (postId: number | string, data: CommentType) => {
    postId = +postId;
    const entityData = { ...data, blogPost: postId };
    return commentDB.createComment(entityData);
  };

  const deleteComment = (id: number | string | (number | string)[]) => commentDB.deleteComment(id);

  return {
    getComments,
    createComment,
    deleteComment,
  };
};
