'use strict';

/**
 * modules
 */
const is = require('is');

/**
 * Models
 */
const BlogPost = require('../models/blog-post.model');


function index(req, res) {
    /*
    We'll keep it simple for now, but here we could load latests comments, user likes, stats...
    */

    // List Blog posts
    BlogPost.list((err, result) => {
        if (err) {
            return res.render('index', { blogPosts:null, error : {message : 'Could not load posts'}});
        }
        res.render('admin/index', { blogPosts: result.entities, pageId:'admin-index'});
    });
}

module.exports = {
    index   : index
};