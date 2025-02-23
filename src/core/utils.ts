export type WithTimestamps<T> = T & {
  createdAt: Date;
  updatedAt: Date;
};
