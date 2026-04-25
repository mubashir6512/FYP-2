import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    positive: boolean;
  };
  icon: React.ElementType;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "text-accent",
}: StatCardProps) {
  return (
    <div className="stat-card bg-card border border-border/50">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {change && (
            <p
              className={cn(
                "text-sm mt-2 font-medium",
                change.positive ? "text-success" : "text-destructive"
              )}
            >
              {change.positive ? "+" : ""}
              {change.value}% from last month
            </p>
          )}
        </div>
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center bg-muted",
            iconColor
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}

interface DataTableProps {
  columns: { key: string; label: string; className?: string }[];
  data: Record<string, ReactNode>[];
  onRowClick?: (row: Record<string, ReactNode>) => void;
}

export function DataTable({ columns, data, onRowClick }: DataTableProps) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground py-4 px-6",
                    col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn("py-4 px-6", col.className)}>
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-foreground text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
