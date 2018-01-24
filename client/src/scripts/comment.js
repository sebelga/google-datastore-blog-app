import axios from "axios";

import { apiBase } from "./config";

const loadMoreComments = id => {
    axios
        .get(`${apiBase}/blog/${id}/comments?start=${nextPage}`)
        .then(response => {
            if (response.data.entities) {
                response.data.entities.forEach(comment => {
                    list.append(commentToLi(comment));
                    $(`#comment-${comment.id}`)
                        .find("button.delete")
                        .click(deleteComment);
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
};

const submitComment = (e, id) => {
    e.preventDefault();

    const values = form.serializeArray();
    const author = values[0].value;
    const comment = values[1].value;

    const data = {
        blogPost: blogPostId,
        author,
        comment
    };

    // window.console.log("Submitting comment.....", data);

    axios
        .post(`${apiBase}/blog/${id}/comments`, data)
        .then(response => {
            list.prepend(commentToLi(response.data));
            $(`#comment-${response.data.id}`)
                .find("button.delete")
                .click(deleteComment);
        })
        .catch(error => {
            window.console.log(error);
        });
};

const deleteComment = () => {
    const id = $(this).attr("comment-id");

    window.axios
        .delete(`${apiBase}/comments/${id}`)
        .then(() => $(`#comment-${id}`).remove())
        .catch(error => window.console.log(error));
};

const commentToLi = entity => {
    const { id, createdOnAgo, comment } = entity;

    let li = `
        <li id="comment-${id}">
            <div class="author">
                ${entity.author} wrote ${createdOnAgo}
            </div>
            <div class="comment">${comment}</div>
            <button class="delete" comment-id="${id}"><i class="fa fa-close"></i></button>
        </li>
    `;

    return li;
};

const init = (blogPostId, list, loadMore, form) => {
    let nextPage = loadMore.start;

    loadMore.button.click(() => loadMoreComments(blogPostId));

    form.submit(e => submitComment(e, blogPostId));

    list.find("button.delete").each((i, el) => {
        $(el).click(deleteComment);
    });
};

export default { init };
