import axios from 'axios';

import { API_BASE } from './config';

let blogPostId;
let nextPage;
let commentFormEl;
let commentsEl;
let commentFormErrorsEl;

const deleteComment = e => {
  const id = parseInt(e.currentTarget.dataset.commentId, 10);
  return axios
    .delete(`${API_BASE}/comments/${id}`)
    .then(() => {
      const commentEl = document.getElementById(`comment-${id}`);
      commentEl.remove();
    })
    .catch(error => window.console.log(error));
};

const loadComments = id => {
  let uri = `${API_BASE}/blog/${id}/comments`;
  if (nextPage) {
    uri += `?start=${nextPage}`;
  }
  return axios
    .get(uri)
    .then(response => {
      if (response.data.entities) {
        response.data.entities.forEach(comment => {
          const commentEl = createCommentElementFromEntity(comment);
          commentsEl.append(commentEl);
        });

        if (response.data.nextPageCursor && response.data.entities.length > 0) {
          nextPage = encodeURIComponent(response.data.nextPageCursor);
          document.querySelector('#load-more-comments button').classList.remove('is-hidden');
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

  commentFormErrorsEl.classList.add('is-hidden');

  const name = e.target.elements[0].value;
  const website = e.target.elements[1].value || null;
  const comment = e.target.elements[2].value;

  const postData = {
    name,
    website,
    comment,
  };

  return axios
    .post(`${API_BASE}/blog/${blogPostId}/comments`, postData)
    .then(response => {
      const commentEl = createCommentElementFromEntity(response.data);
      commentsEl.insertBefore(commentEl, commentsEl.firstChild);
      commentFormEl.reset();
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
      commentFormErrorsEl.classList.remove('is-hidden');
      commentFormErrorsEl.innerHTML = message;
    });
};

const createCommentElementFromEntity = entity => {
  const { id, createdOnFormatted, comment, name, website } = entity;

  const nameRendered = website ? `<a href="${website}" class="tag" target="_blank">${name}</a>` : name;

  const node = document.createElement('article');
  node.id = `comment-${id}`;
  node.className = 'media';
  node.innerHTML = `
        <div class="media-content comment">
            <div class="content">
                <p>
                    <strong>${nameRendered}</strong> <small>wrote ${createdOnFormatted}</small><br>
                    ${comment}
                </p>
                <button class="delete" data-comment-id="${id}"></delete>
            </div>
        </div>
    `;

  node.querySelector('.delete').addEventListener('click', deleteComment);

  return node;
};

const pageReady = pageId => {
  if (pageId === 'blogpost-view') {
    blogPostId = window.__blogPostData.id;

    commentsEl = document.getElementById('comments-wrapper');
    commentFormErrorsEl = document.getElementById('comment-form-errors');
    commentFormEl = document.getElementById('form-comment');

    if (commentFormEl) {
      commentFormEl.addEventListener('submit', submitComment);
    }

    const buttonsDeleteComments = Array.prototype.slice.apply(document.querySelectorAll('.comment .delete'));
    buttonsDeleteComments.forEach(el => el.addEventListener('click', deleteComment));

    const btnLoadMore = document.getElementById('load-more-comments');
    if (btnLoadMore) {
      btnLoadMore.addEventListener('click', () => loadComments(blogPostId));
    }

    // load BlogPost comments
    loadComments(blogPostId);
  }
};

export default { pageReady };
