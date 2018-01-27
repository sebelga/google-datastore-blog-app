import axios from "axios";

import { apiBase } from "./config";

let blogPostId;
let nextPage;
let commentFormDOM;
let commentsDOM;
let commentFormErrorsDOM;

const deleteComment = e => {
    const id = parseInt(e.currentTarget.dataset.commentId, 10);

    axios
        .delete(`${apiBase}/comments/${id}`)
        .then(() => {
            const commentNode = document.getElementById(`comment-${id}`);
            commentNode.remove();
        })
        .catch(error => window.console.log(error));
};

const loadMoreComments = id => {
    axios
        .get(`${apiBase}/blog/${id}/comments?start=${nextPage}`)
        .then(response => {
            if (response.data.entities) {
                response.data.entities.forEach(comment => {
                    commentsDOM.append(commentNode(comment));
                    // $(`#comment-${comment.id}`)
                    //     .find("button.delete")
                    //     .click(deleteComment);
                });

                if (
                    response.data.nextPageCursor &&
                    response.data.entities.length > 0
                ) {
                    nextPage = response.data.nextPageCursor;
                } else {
                    // No more comments (hide button)
                    document.querySelector('#load-more-comments button').classList.add('is-hidden');
                }
            }
        })
        .catch(error => {
            window.console.log(error);
        });
};

const submitComment = (e, id) => {
    e.preventDefault();
    commentFormErrorsDOM.classList.add('is-hidden');
    const postId = parseInt(e.target.dataset.postId, 10);
    const name = e.target.elements[0].value;
    const website = e.target.elements[1].value || null;
    const comment = e.target.elements[2].value;

    const data = {
        blogPost: postId,
        name,
        website,
        comment
    };

    axios
        .post(`${apiBase}/blog/${postId}/comments`, data)
        .then(response => {
            commentsDOM.insertBefore(commentNode(response.data), commentsDOM.firstChild);
            commentFormDOM.reset();
            // commentsDOM.prepend(commentNode(response.data));

            // const btn = document.querySelector(
            //     `#comment-${response.data.id} .comment-delete`
            // );
            // btn.addEventListener("click", deleteComment);
            // // $(`#comment-${response.data.id}`)
            // //     .find("button.delete")
            // //     .click(deleteComment);
        })
        .catch(res => {
            const error = res.response.data;
            let message;
            if (error.name == 'ValidationError') {
                message = error.details.reduce((acc, err) => {
                    acc += `${err.message}<br>`;
                    return acc;
                }, '');
            } else {
                message = error.message;
            }
            commentFormErrorsDOM.classList.remove('is-hidden');
            commentFormErrorsDOM.innerHTML = message;
        });
};

const commentNode = entity => {
    const { id, createdOnAgo, comment, name } = entity;

    const node = document.createElement("article");
    node.id = `comment-${id}`;
    node.className = "media"
    node.innerHTML = `
        <div class="media-content">
            <div class="content">
                <p>
                    <strong>${name}</strong> <small>wrote ${createdOnAgo}</small><br>
                    ${comment}
                </p>
            </div>
        </div>
    `;

    // const buttonNode = document.createElement("button");
    // buttonNode.classList.add("comment-delete");
    // buttonNode.dataset.commentId = id;
    // buttonNode.innerHTML = '<i class="fa fa-close"></i>';
    // buttonNode.addEventListener("click", deleteComment);
    // node.appendChild(buttonNode);

    return node;
};

const pageReady = pageId => {
    if (pageId === "blogpost-view") {
        blogPostId = window.__blogPostData.id;
        nextPage = window.__blogPostData.nextPage;
        commentsDOM = document.getElementById("comments-wrapper");
        commentFormErrorsDOM = document.getElementById('comment-form-errors');

        commentFormDOM = document.getElementById("form-comment");
        commentFormDOM.addEventListener("submit", submitComment);

        const buttonsDeleteComments = Array.prototype.slice.apply(
            document.querySelectorAll(".comment-delete")
        );
        buttonsDeleteComments.forEach(el => el.addEventListener("click", deleteComment));

        const btnLoadMore = document.getElementById('load-more-comments');
        if (btnLoadMore) {
            btnLoadMore.addEventListener('click', () => loadMoreComments(blogPostId));
        }
    }
};

export default { pageReady };
