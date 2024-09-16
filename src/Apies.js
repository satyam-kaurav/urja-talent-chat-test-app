import axios from "axios";

const Axios = axios.create({ baseURL: "http://localhost:4000" });

export const createConvo = async (token, { id, role }) => {
  try {
    const response = await Axios.post(
      "/chat/conversation",
      {
        id,
        role,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log({ response: response.data });

    if (response.data.res_type !== "success") return null;

    return response.data.data;
  } catch (error) {
    console.log(error);
  }
};

export const getConvoList = async (token) => {
  try {
    const response = await Axios.get("/chat/list", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data.res_type !== "success") return null;

    return response.data.data;
  } catch (error) {
    console.log(error);
  }
};

export const getMessages = async (token, id) => {
  try {
    const response = await Axios.get(`/chat/messages/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data.res_type !== "success") return null;

    return response.data.data;
  } catch (error) {
    console.log(error);
  }
};
