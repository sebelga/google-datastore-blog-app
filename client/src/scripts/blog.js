import axios from "axios";
import SimpleMDE from 'simplemde';

import { apiBase } from "./config";

const deletePost = id =>
    axios
        .delete(`${apiBase}/blog/${id}`, {
            headers: { "Content-type": "application/json" },
            data: null // data null is necessary to pass the headers
        })
        .then(() => document.location.reload())
        .catch(error => {
            console.log(error);
            // app.notificationService.error(error.message)
        });

const deleteImage = id => {
    if (!id) {
        console.log("[Warning] Missing 'id' to delete BlogPost image.");
        return;
    }
    return axios
        .patch(
            `${apiBase}/blog/${id}`,
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

const attachDeletePostHandler = () => {
    const links = Array.prototype.slice.call(document.querySelectorAll('.delete-post'), 0);

    if (links.length > 0) {
        links.forEach((el) => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const id = el.dataset.postId;
                deletePost(id);
            });
        });
    }
};

const initMarkdownEditor = () => {
    const simplemde = new SimpleMDE();
};

const initImageUpload = () => {
    const input = document.querySelector('.file-input');
    const fileName = document.querySelector('.file-name');

    if (input) {
        input.addEventListener('change', (e) => {
            fileName.innerHTML = input.files[0].name;
            fileName.classList.remove('is-invisible');
        });
    }
};

const initBtnSubmit = () => {
    const btns = Array.prototype.slice.call(document.querySelectorAll('.button-submit'));

    btns.forEach((btn) => {
        btn.addEventListener('click', () => btn.classList.add('is-loading'));
    });
};

const pageReady = (page) => {
    attachDeletePostHandler();

    if(page === 'blogpost-edit') {
        initMarkdownEditor();
        initImageUpload();
        initBtnSubmit();
    }
};

export default {
    pageReady,
};
