import { Query, QueryListOptions } from 'gstore-node';
import { DatastoreTransaction } from '@google-cloud/datastore/transaction';

import { CommentType } from './models';
import { Context, Modules } from '../models';

export interface CommentDomain {
  getComments(postId: number | string, options?: QueryListOptions & { withVirtuals?: boolean }): Promise<any>;
  createComment(postId: number | string, data: CommentType): Promise<CommentType>;
  deleteComment(id: number | string | (number | string)[]): Promise<any>;
  createQuery(namespace?: string, transaction?: DatastoreTransaction): Query<CommentType>;
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
    return commentDB.createComment(entityData).then(entity => entity.plain({ virtuals: true }));
  };

  const deleteComment = (id: number | string | (number | string)[]) => commentDB.deleteComment(id);

  const createQuery = commentDB.createQuery;

  return {
    getComments,
    createComment,
    deleteComment,
    createQuery,
  };
};
