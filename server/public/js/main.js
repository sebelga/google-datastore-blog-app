"use strict";

(function bootstrap() {
    const apiBase = "/api/v1";

    function App() {
        this.userService = new UserService();
        this.blogPostService = new BlogPostService();
        this.commentsService = new CommentsService();
        this.notificationService = new NotificationService();
    }
    const app = new App();
    window.app = app;

    // -----------------------------------------------------------

    // ----------blog service
    function BlogPostService() {}

    BlogPostService.prototype.deletePost = blogPostId => {
        window.axios
            .delete(`${apiBase}/blog/${blogPostId}`, {
                headers: { "Content-type": "application/json" },
                data: null // data null is necessary to pass the headers
            })
            .then(() => {
                /**
                 * As there is an "eventual" consistency in the Datastore outside Entity Groups
                 * we wait 1.5 seconds before reloading the page to make sure changes are reflected.
                 */
                app.notificationService.show("Blog post deleted successully.");
                setTimeout(() => document.location.reload(), 1500);
            })
            .catch(error => app.notificationService.error(error.message));
    };

    BlogPostService.prototype.deleteImage = blogPostId => {
        if (!blogPostId) {
            console.log(
                "[Warning] BlogPost id to delete image from is missing."
            );
            return;
        }
        window.axios
            .patch(
                `${apiBase}/blog/${blogPostId}`,
                { posterUri: null },
                {
                    headers: { "Content-type": "application/json" }
                }
            )
            .then(() => {
                app.notificationService.show("Image deleted");

                // Remove Preview image
                $(".feature-image .img-preview").remove();

                // Show the input type file
                $(".feature-image .pure-group.hidden").removeClass("hidden");
            })
            .catch(error => {
                window.console.log(error);
            });
    };

    // ----------comments service
    function CommentsService() {}

    CommentsService.prototype.init = (blogPostId, list, loadMore, form) => {
        let nextPage = loadMore.start;

        loadMore.button.click(loadMoreComments);

        form.submit(submitComment);

        list.find("button.delete").each((i ,el) => {
            $(el).click(deleteComment);
        });

        // -----------------

        function loadMoreComments() {
            window.axios
                .get(`${apiBase}/blog/${blogPostId}/comments?start=${nextPage}`)
                .then(response => {
                    if (response.data.entities) {
                        response.data.entities.forEach(comment => {
                            list.append(commentToLi(comment));
                            // $(".blog-post__comment").forEach(function(el) {
                            //     el.click(deleteComment);
                            // });
                        });

                        if (
                            response.data.nextPageCursor &&
                            response.data.entities.length > 0
                        ) {
                            nextPage = response.data.nextPageCursor;
                        } else {
                            // No more comments (hide button)
                            loadMore.button.hide();
                        }
                    }
                })
                .catch(error => {
                    window.console.log(error);
                });
        }

        function submitComment(e) {
            e.preventDefault();

            const values = form.serializeArray();
            const author = values[0].value;
            const comment = values[1].value;

            const data = {
                blogPost: blogPostId,
                author,
                comment
            };

            window.console.log("Submitting comment.....", data);

            window.axios
                .post(`${apiBase}/blog/${blogPostId}/comments`, data)
                .then(response => {
                    list.prepend(commentToLi(response.data));
                    $(`#comment-${response.data.id}`)
                        .find("button.delete")
                        .click(deleteComment);
                })
                .catch(error => {
                    window.console.log(error);
                });
        }

        function deleteComment(e) {
            const commentId = $(this).attr("comment-id");

            window.axios
                .delete(`${apiBase}/comments/${commentId}`)
                .then(() => $(`#comment-${commentId}`).remove())
                .catch(error => window.console.log(error));
        }

        function commentToLi(entity) {
            let str = `<li id="comment-${entity.id}"><div class="author">`;
            str += `${entity.author} wrote ${entity.createdOnAgo}`;
            str += '</div><div class="comment">';
            str += entity.comment;
            str += "</div>";
            str += `<button class="delete" comment-id="${
                entity.id
            }"><i class="fa fa-close"></i></button>`;
            str += "</li>";
            return str;
        }
    };

    // ----------notification service
    function NotificationService() {}

    NotificationService.prototype.show = (message, type) => {
        type = typeof type === "undefined" ? "info" : type;
        window.toastr[type](message);
    };

    NotificationService.prototype.error = message => {
        window.toastr.error(message);
    };

    // ----------user service
    function UserService() {
        this.token = "abcdef12345678";
    }

    UserService.prototype.setToken = token => {
        this.token = token;
    };

    UserService.prototype.getToken = () => this.token;
})(window, $);
