"use strict";

import DocReady from 'es6-docready';

import blog from './blog';
import comment from './comment';
import notifs from './notifications';
import user from './user';

import '../styles/main.scss';

const app = {
    blog,
    comment,
    notifs,
    user,
};

DocReady(() => {
    blog.pageReady(window.pageId);
});

window.app = app;
