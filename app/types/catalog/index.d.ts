export interface category {
  category_id: number;
  category_name: string;
}

export interface group {
  group_id: number;
  group_name: string;
  image: null | string;
  categories: Array<category>;
}

export interface groupRow {
  group_id: number;
  group_name: string;
  image: null | string;
  category_id: number;
  category_name: string;
}

export interface productOnListingPage {
  product_id: number;
  product_name: string;
  product_price: number;
  producer_name: string;
  is_available: number;
  image: null | string;
  category_id: number;
  category_name: string;
}

export interface listingPage {
  products: Array<productOnListingPage>;
  totalResults: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  sortBy: string;
  sort: string;
  filters: listingFilter[];
  producers: producersByCategory[];
}

export interface listingFilter {
  filter_id: number;
  filter_name: string;
  filter_type: "checkbox" | "range";
}

export interface filterOnListingPage {
  producer_id: number[] | undefined;
  priceRange:
    | {
        minValue: number | undefined;
        maxValue: number | undefined;
      }
    | undefined;
  is_available: boolean | undefined;
}

export interface fetchProductsByCategoryParams {
  page: undefined | string;
  sortBy: undefined | string;
  sort: undefined | string;
  filters: filterOnListingPage | undefined;
}

export interface producersByCategory {
  producer_id: number;
  producer_name: string;
  product_count: number;
}
