import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { cn } from "@/lib/utils";

interface ToolShellProps {
  breadcrumbs: BreadcrumbItem[];
  children: React.ReactNode;
  className?: string;
}

export function ToolShell({ breadcrumbs, children, className }: ToolShellProps) {
  return (
    <div className={cn("pb-16 pt-8 sm:pt-10", className)}>
      <div className="container-page max-w-tool">
        <Breadcrumbs items={breadcrumbs} />
        <div className="mt-6 space-y-10">{children}</div>
      </div>
    </div>
  );
}
