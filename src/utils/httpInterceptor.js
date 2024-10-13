import axios from "axios";
import { baseUrl } from "../environment/environment";

const instance = axios.create({
  baseURL: baseUrl,
});

instance.interceptors.request.use(
  (config) => {
    const userData = localStorage.getItem("token");

    if (userData) {
      config.headers["x-access-token"] = userData;
      config.headers["authorization"] = `Bearer ${userData}`;
    }
    config.headers["ngrok-skip-browser-warning"] = true;
    console.log(config);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // localStorage.clear();
      // window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default instance;
