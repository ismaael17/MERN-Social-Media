import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8082/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const signIn = async (login, password) => {
  try {
    const response = await api.post("/users/login/", { login, password });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
