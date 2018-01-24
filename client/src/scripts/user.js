let token = "abcdef12345678";

const setToken = _token => (token = _token);
const getToken = () => token;

const user = {
    setToken,
    getToken
};

export default user;
