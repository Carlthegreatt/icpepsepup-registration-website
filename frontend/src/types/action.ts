export type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
};
