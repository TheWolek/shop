export interface basket {
  basket_token: string;
  items: Array | productInBasket[];
  selectedShipmentMethod: null | selectedShipmentMethod;
  selectedPaymentMethod: null | selectedPaymentMethod;
  comment: string;
  totalPrice: number;
}

export interface productInBasket {
  product_id: number;
  count: number;
  price: number;
  product_name: string;
  producer_name: string;
  product_category_id: number;
  catalog_price: number;
  is_available: number;
  image: null | string;
}

export interface product {
  product_id: number;
  count: number;
}

export interface existingProductFromDB {
  product_id: number;
  product_name: string;
  product_price: number;
}

export interface createBasketReq {
  items: productInBasket[];
}

export interface selectedShipmentMethod {
  id: number;
  price: number;
  name: string;
  image: string | null;
}

export interface selectedPaymentMethod {
  id: number;
  price: number;
  name: string;
  image: string | null;
}
