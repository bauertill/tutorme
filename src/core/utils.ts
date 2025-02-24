export type WithTimestamps<T> = T & {
  createdAt: Date;
  updatedAt: Date;
};

export type Draft<T, K extends keyof T = never> = Omit<
  T,
  K | "id" | "createdAt" | "updatedAt"
>;
