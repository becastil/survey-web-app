export type ParsedSheet = {
  name: string;
  rows: Record<string, any>[];
  headers: string[];
};

export type ChartType = "bar" | "line" | "area" | "pie" | "scatter";

export type ChartConfig = {
  type: ChartType;
  xKey: string | null;
  yKeys: string[];
  categoryKey: string | null; // used for pie charts
  valueKey: string | null; // used for pie charts
  groupKey: string | null;
  aggregate: "count" | "sum";
};

export type TableState = {
  pageIndex: number;
  pageSize: number;
  globalFilter: string;
};
