"use strict";

const marked = require("marked");

const DB = require("./blog-post.db");

/**
 * Get a list of BlogPosts
 * @param {*} options Object of options ("start" and "limit" parameters)
 */
const getPosts = (options = {}) => DB.getPosts(options);

/**
 * Get a BlogPost
 * @param {*} id Id of the BlogPost to fetch
 * @param {*} dataloader optional. A Dataloader instance
 */
const getPost = async (id, dataloader) => {
    id = +id;
    if (isNaN(id)) {
        throw new Error("BlogPost id must be an integer");
    }

    let post;
    try {
        post = await DB.getPost(id, dataloader);
    } catch (err) {
        throw err;
    }

    if (post && post.content) {
        // Convert markdown to Html
        post.contentToHtml = marked(post.content);
    }

    return post;
};

/**
 * Create a BlogPost
 * @param {*} data BlogPost entity data
 * @param {*} dataloader optional Dataloader instance from the request
 */
const createPost = (data, dataloader) => DB.createPost(data, dataloader);

/**
 * Update a BlogPost entity in the Datastore
 * @param {*} id Id of the BlogPost to update
 * @param {*} data BlogPost entity data
 * @param {*} dataloader optional Dataloader instance for the request
 * @param {*} replace optional replace data in Datastore (default false)
 */
const updatePost = (id, data, dataloader, replace = false) => {
    id = +id;
    if (isNaN(id)) {
        throw new Error("BlogPost id must be an integer");
    }
    return DB.updatePost(id, data, dataloader, replace);
};

/**
 * Delete a BlogPost entity in the Datastore
 * @param {*} id Id of the BlogPost to delete
 */
const deletePost = id => {
    id = +id;
    return DB.deletePost(id);
};

module.exports = {
    getPosts,
    getPost,
    createPost,
    updatePost,
    deletePost
};
