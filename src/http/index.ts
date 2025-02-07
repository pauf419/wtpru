import axios from "axios";

const $api = axios.create({
  withCredentials: true,
  baseURL: "/api",
});

$api.interceptors.response.use(
  (config) => {
    return config;
  },
  async (error) => {
    if (error.response.data.status && error.response.data.msg) {
      //store.updateLog(error.response.status, error.response.data.msg);
    }
    throw error;
  }
);

export default $api;
