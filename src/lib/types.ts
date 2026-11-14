import type { components } from "./contract.generated";
export type Account = components["schemas"]["Account"];
export type MergeRejection = components["schemas"]["MergeRejection"];
export type LoginResult = components["schemas"]["AuthTokens"];
export type Product = components["schemas"]["Product"];
export type Cart = components["schemas"]["Cart"];
export type Page<T> = {
  items: T[];
  nextCursor: string | null;
  hasNext: boolean;
};
export type Problem = {
  code?: string;
  title?: string;
  detail?: string;
  correlationId?: string;
  fieldErrors?: Record<string, string>;
};
