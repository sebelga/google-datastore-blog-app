var blogPostController = require('../controllers/blog-post.controller');
var images             = require('../helpers/images');

function blogPostRoutes(router) {
    router.route('/blog')
            .get(blogPostController.list);

    router.route('/blog/:id')
            .get(blogPostController.get);

    router.route('/admin/blog/new')
            .get(blogPostController.create)
            .post(images.multer.single('image'),
                    images.sendUploadToGCS,
                    blogPostController.create);

    router.route('/admin/blog/edit/:id')
            .get(blogPostController.edit)
            .post(images.multer.single('image'),
                    images.sendUploadToGCS,
                    blogPostController.edit);

    router.route('/admin/blog/:id')
            .get(blogPostController.get)
            .delete(blogPostController.delete);
}

module.exports = blogPostRoutes;
