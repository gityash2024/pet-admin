import axios from "axios";

const httpEncap = {
  getAll: (url) => {
    return axios.get(url);
  },
  get: (url, data, options) => {
    let config = { params: data };
    if (options?.responseType) {
      config.responseType = options.responseType;
    }
    return axios.get(url, config);
  },
  patch: (url, body, options) => {
    return axios.patch(url, body, options);
  },
  post: (url, body, options) => {
    return axios.post(url, body, options);
  },
  put: (url, body) => {
    return axios.put(url, body);
  },
  delete: (url) => {
    return axios.delete(url);
  },
  getFileData: (url) => {
    return axios.get(url, { responseType: "arraybuffer" });
  },
};

export default httpEncap;
