export interface Post {
  id: number;
  subject: string;
  content: string;
  category: string;
  price: number;
  author: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    bio?: string;
    personalImage?: string;
  };
  createdAt?: string;
  status?: string;
}

export interface PagedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
}
