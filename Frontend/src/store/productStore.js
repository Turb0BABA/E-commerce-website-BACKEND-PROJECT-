import { create } from "zustand";
import API from "../api/axios";

const useProductStore = create((set) => ({
  products: [],
  product: null,
  loading: false,

  fetchProducts: async () => {
    try {
      set({ loading: true });
      const res = await API.get("/products");
      set({ products: res.data.products, loading: false });
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },

  fetchProductById: async (id) => {
    try {
      set({ loading: true });
      const res = await API.get(`/products/${id}`);
      set({ product: res.data.product, loading: false });
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },
}));

export default useProductStore;
