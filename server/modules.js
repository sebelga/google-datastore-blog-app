'use strict';

const Blog = require('./modules/blog');
const Admin = require('./modules/admin');
const Images = require('./modules/images');

module.exports = context => {
  /**
   * Initialize our module by passing the context + each module dependencies
   */
  const images = Images(context);
  const blog = Blog(context, { images });
  const admin = Admin(context, { blog, images });

  return {
    blog,
    admin,
    images,
  };
};
