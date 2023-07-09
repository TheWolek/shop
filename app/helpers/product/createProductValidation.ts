import { createProductReqBody } from "../../types/product/productTypes";

export default (productReqBody: createProductReqBody): [boolean, string] => {
  if (
    productReqBody.category_id === undefined ||
    productReqBody.category_id === 0
  ) {
    return [false, "pole category_id jest wymagane"];
  }
  if (
    productReqBody.product_name === undefined ||
    productReqBody.product_name === ""
  ) {
    return [false, "pole product_name jest wymagane"];
  }
  if (
    productReqBody.product_price === undefined ||
    productReqBody.product_price === 0
  ) {
    return [false, "pole product_price jest wymagane"];
  }
  if (
    productReqBody.producer_id === undefined ||
    productReqBody.producer_id === 0
  ) {
    return [false, "pole producer_id jest wymagane"];
  }
  if (
    productReqBody.is_available === undefined ||
    productReqBody.is_available === null
  ) {
    return [false, "pole is_available jest wymagane"];
  }

  if (!Number.isInteger(productReqBody.category_id)) {
    return [false, "zły format pola category_id"];
  }
  if (!Number.isInteger(productReqBody.product_price)) {
    return [false, "zły format pola product_price"];
  }
  if (!Number.isInteger(productReqBody.producer_id)) {
    return [false, "zły format pola producer_id"];
  }
  if (typeof productReqBody.is_available !== "boolean") {
    return [false, "zły format pola is_available"];
  }

  return [true, ""];
};
