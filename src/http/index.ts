import axios from "axios";
import { store } from "../index";

const $api = axios.create({
  withCredentials: true,
  baseURL: "http://localhost:6100/api",
});

$api.interceptors.response.use(
  (config) => {
    return config;
  },
  async (error) => {
    if (error.response.data.status && error.response.data.msg) {
      store.updateLog(error.response.status, error.response.data.msg);
    }
    throw error;
  }
);

export default $api;
