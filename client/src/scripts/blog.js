import axios from "axios";
import SimpleMDE from "simplemde";

import { apiBase } from "./config";

const deletePost = id =>
    axios
        .delete(`${apiBase}/blog/${id}`, {
            headers: { "Content-type": "application/json" },
            data: null // data null is necessary to pass the headers
        })
        .then(() => window.location.assign("/admin?cache=false"))
        .catch(error => {
            window.location.assign("/admin?cache=false");
        });

const addDeleteHandler = () => {
    const links = Array.prototype.slice.call(
        document.querySelectorAll(".delete-post"),
        0
    );

    if (links.length > 0) {
        links.forEach(el => {
            el.addEventListener("click", e => {
                e.preventDefault();
                e.currentTarget.style.pointerEvents = "none";
                e.currentTarget
                    .querySelector("i")
                    .classList.remove("is-hidden");
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
    const input = document.querySelector(".file-input");
    const fileName = document.querySelector(".file-name");

    if (input) {
        input.addEventListener("change", e => {
            fileName.innerHTML = input.files[0].name;
            fileName.classList.remove("is-invisible");
        });
    }
};

const initBtnSubmit = () => {
    const btns = Array.prototype.slice.call(
        document.querySelectorAll(".button-submit")
    );
    btns.forEach(btn =>
        btn.addEventListener("click", () => btn.classList.add("is-loading"))
    );
};

const pageReady = page => {
    switch (page) {
        case "admin-index":
            addDeleteHandler();
            break;
        case "blogpost-edit":
            initMarkdownEditor();
            initImageUpload();
            initBtnSubmit();
            break;
    }
};

export default {
    pageReady
};
