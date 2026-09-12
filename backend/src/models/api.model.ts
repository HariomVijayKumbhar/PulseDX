export interface ApiSuccessResponse<T> {
  data: T;
  meta?: {
    total?: number;
    count?: number;
    timestamp: string;
  };
}

export interface ApiErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}
