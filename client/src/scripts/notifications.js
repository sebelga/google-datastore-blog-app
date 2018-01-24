const show = (message, type) => {
    // type = typeof type === "undefined" ? "info" : type;
    // toastr[type](message);
    console.log('SHOW notification', message);
};

// const error = message => toastr.error(message);
const error = message => console.log('TODO show error notification');

export default { show, error };
