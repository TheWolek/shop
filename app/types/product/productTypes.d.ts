export interface product {
  product_id: number;
  product_name: string;
  product_price: number;
  producer_id: number;
  producer_name: string;
  is_available: number | boolean;
  producer_code: null | string;
  description: null | string;
  image: null | string;
  category_id: number;
  category_name: string;
}

export interface createProductReqBody {
  product_name: string;
  product_price: number;
  producer_id: number;
  is_available: boolean;
  producer_code: null | string;
  description: null | string;
  image: null | string;
  category_id: number;
}

export interface updateProductReqBody {
  product_name: string;
  product_price: number;
  is_available: boolean;
  producer_code: null | string;
  description: null | string;
  image: null | string;
}
