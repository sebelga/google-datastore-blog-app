var commentController = require("../controllers/comment.controller");

function blogPostRoutes(router) {
    router
        .route("/blog/:id/comments")
        .get(commentController.list)
        .post(commentController.create);

    router.route("/comments/:id").delete(commentController.delete);
}

module.exports = blogPostRoutes;
