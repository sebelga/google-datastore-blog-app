import axios from "axios";

import { apiBase } from "./config";

let blogPostId;
let nextPage;
let commentFormDOM;
let commentsDOM;
let commentFormErrorsDOM;

const deleteComment = e => {
    const id = parseInt(e.currentTarget.dataset.commentId, 10);

    return axios
        .delete(`${apiBase}/comments/${id}`)
        .then(() => {
            const commentNode = document.getElementById(`comment-${id}`);
            commentNode.remove();
        })
        .catch(error => window.console.log(error));
};

const loadMoreComments = id => {
    return axios
        .get(`${apiBase}/blog/${id}/comments?start=${nextPage}`)
        .then(response => {
            if (response.data.entities) {
                response.data.entities.forEach(comment => {
                    commentsDOM.append(commentNode(comment));
                });

                if (
                    response.data.nextPageCursor &&
                    response.data.entities.length > 0
                ) {
                    nextPage = response.data.nextPageCursor;
                } else {
                    // No more comments (hide button)
                    document
                        .querySelector("#load-more-comments button")
                        .classList.add("is-hidden");
                }
            }
        })
        .catch(error => {
            window.console.log(error);
        });
};

const submitComment = (e, id) => {
    e.preventDefault();

    commentFormErrorsDOM.classList.add("is-hidden");

    const name = e.target.elements[0].value;
    const website = e.target.elements[1].value || null;
    const comment = e.target.elements[2].value;

    const data = {
        blogPost: blogPostId,
        name,
        website,
        comment
    };

    return axios
        .post(`${apiBase}/blog/${blogPostId}/comments`, data)
        .then(response => {
            commentsDOM.insertBefore(
                commentNode(response.data),
                commentsDOM.firstChild
            );
            commentFormDOM.reset();
        })
        .catch(res => {
            const error = res.response.data;
            let message;
            if (error.name == "ValidationError") {
                message = error.details.reduce((acc, err) => {
                    acc += `${err.message}<br>`;
                    return acc;
                }, "");
            } else {
                message = error.message;
            }
            commentFormErrorsDOM.classList.remove("is-hidden");
            commentFormErrorsDOM.innerHTML = message;
        });
};

const commentNode = entity => {
    const { id, createdOnAgo, comment, name, website } = entity;

    const nameRendered = website ? `<a href="${website}" class="tag" target="_blank">${name}</a>` : name;

    const node = document.createElement("article");
    node.id = `comment-${id}`;
    node.className = "media";
    node.innerHTML = `
        <div class="media-content comment">
            <div class="content">
                <p>
                    <strong>${nameRendered}</strong> <small>wrote ${createdOnAgo}</small><br>
                    ${comment}
                </p>
                <button class="delete" data-comment-id="${id}"></delete>
            </div>
        </div>
    `;

    node.querySelector(".delete").addEventListener("click", deleteComment);

    return node;
};

const pageReady = pageId => {
    if (pageId === "blogpost-view") {
        blogPostId = window.__blogPostData.id;
        nextPage = window.__blogPostData.nextPage;
        commentsDOM = document.getElementById("comments-wrapper");
        commentFormErrorsDOM = document.getElementById("comment-form-errors");

        commentFormDOM = document.getElementById("form-comment");
        commentFormDOM.addEventListener("submit", submitComment);

        const buttonsDeleteComments = Array.prototype.slice.apply(
            document.querySelectorAll(".comment .delete")
        );
        buttonsDeleteComments.forEach(el =>
            el.addEventListener("click", deleteComment)
        );

        const btnLoadMore = document.getElementById("load-more-comments");
        if (btnLoadMore) {
            btnLoadMore.addEventListener("click", () =>
                loadMoreComments(blogPostId)
            );
        }
    }
};

export default { pageReady };
