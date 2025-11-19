import API from "./axios";

export const addToCartAPI = (productId, quantity = 1) =>
  API.post("/cart/add", { productId, quantity });

export const getCartAPI = () => API.get("/cart");
