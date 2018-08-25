import { Gstore } from 'gstore-node';
import { Logger } from 'winston';
import { ImagesModule } from '../images/index';
import { UtilsModule } from '../utils/index';
import { BlogPostModule } from './blog-post';
import { BlogPostDB } from './blog-post/blog-post.db';
import { BlogPostDomain } from './blog-post/blog-post.domain';
import { CommentModule } from './comment';
import { CommentDB } from './comment/comment.db';
import { CommentDomain } from './comment/comment.domain';

export type Context = {
  gstore: Gstore;
  logger: Logger;
};

export type Modules = {
  blogPost?: BlogPostModule;
  comment?: CommentModule;
  blogPostDB?: BlogPostDB;
  blogPostDomain?: BlogPostDomain;
  commentDB?: CommentDB;
  commentDomain?: CommentDomain;
  images?: ImagesModule;
  utils?: UtilsModule;
};
