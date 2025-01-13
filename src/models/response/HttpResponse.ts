export interface HttpResponse<T = any> {
  status: number;
  msg: string | null;
  description: string | null;
  json: T;
}
