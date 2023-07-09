import { updateProductReqBody } from "../../types/product/productTypes";

export default (productReqBody: updateProductReqBody): [boolean, string] => {
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
    productReqBody.is_available === undefined ||
    productReqBody.is_available === null
  ) {
    return [false, "pole is_available jest wymagane"];
  }

  if (!Number.isInteger(productReqBody.product_price)) {
    return [false, "zły format pola product_price"];
  }
  if (typeof productReqBody.is_available !== "boolean") {
    return [false, "zły format pola is_available"];
  }

  return [true, ""];
};
