import * as Yup from "yup";

export const ProductSchema = Yup.object({
  id: Yup.string().default(""),
  title: Yup.string().required().default(""),
  description: Yup.string().default(""),
  price: Yup.number().positive().required().defined().default(0),
  image: Yup.string().default(""),
});

export const AvailableProductSchema = ProductSchema.shape({
  count: Yup.number().integer().min(0).required().defined().default(0),
});

export type Product = {
  id: string;
  title: string;
  price: number;
  description?: string;
  image?: string;
};

export type AvailableProduct = Product & {
  count: number;
};
