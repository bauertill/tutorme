import assert from "assert";
import { parse } from "csv-parse";
import { z } from "zod";

export type WithTimestamps<T> = T & {
  createdAt: Date;
  updatedAt: Date;
};

export type Draft<T, K extends keyof T = never> = Omit<
  T,
  K | "id" | "createdAt" | "updatedAt"
>;

export function Draft<T, K extends keyof T = never>(
  obj: z.ZodSchema<T>,
): z.ZodSchema<Draft<T, K>> {
  assert(obj instanceof z.ZodObject);
  return obj.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  }) as unknown as z.ZodSchema<Draft<T, K>>;
}

export async function parseCsv<T>(
  text: string,
  schema: z.ZodSchema<T>,
): Promise<T[]> {
  return await new Promise((resolve, reject) => {
    parse(
      text,
      {
        delimiter: ",",
        columns: true,
        skip_empty_lines: true,
      },
      (err, records) => {
        if (err) reject(err);
        else resolve(z.array(schema).parse(records));
      },
    );
  });
}
