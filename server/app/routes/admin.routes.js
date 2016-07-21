
var adminController = require('../controllers/admin.controller');

var blogPostController = require('../controllers/blog-post.controller');

function adminRoutes(router) {
    router.route('/admin')
            .get(adminController.index);
}

module.exports = adminRoutes;