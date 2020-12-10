import axios from "axios";
import { ACCESS_TOKEN } from "./config";

export const api = () => {
  return axios.create({
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  });
};
