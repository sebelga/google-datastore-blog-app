'use strict';

import DocReady from 'es6-docready';

import blog from './blog';
import comment from './comment';

import '../styles/main.scss';

const app = {
  blog,
  comment,
};

DocReady(() => {
  blog.pageReady(window.pageId);
  comment.pageReady(window.pageId);
});

window.app = app;
