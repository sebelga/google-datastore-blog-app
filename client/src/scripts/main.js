"use strict";

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

window.app = app;
