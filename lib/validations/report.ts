import { z } from "zod";

export const ReportGenerateSchema = z.object({
  type: z.enum(["LOW_STOCK", "TRANSACTION_HISTORY", "STOCK_LEVELS", "SALES_SUMMARY"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  category: z.string().optional(),
  sku: z.string().optional(),
});

export type ReportGenerateInput = z.infer<typeof ReportGenerateSchema>;
