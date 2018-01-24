import axios from "axios";

import { apiBase } from "./config";

const deletePost = id =>
    axios
        .delete(`${apiBase}/blog/${id}`, {
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

export default {
    deletePost,
    deleteImage
};
