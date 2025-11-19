import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
    },

    description: {
      type: String,
      default: "",
    },

    image: {
      type: String, // path or URL
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
