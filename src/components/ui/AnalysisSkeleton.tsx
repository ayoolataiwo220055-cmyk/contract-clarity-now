import { Skeleton } from "@/components/ui/skeleton";

const AnalysisSkeleton = () => {
  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-fade-in">
      {/* Risk Score Skeleton */}
      <div className="card-professional">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded" />
            <Skeleton className="h-6 w-20 rounded" />
            <Skeleton className="h-6 w-16 rounded" />
            <Skeleton className="h-6 w-18 rounded" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </div>

      {/* Summary Card Skeleton */}
      <div className="card-professional">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-3 bg-muted/50 rounded-md">
              <Skeleton className="h-8 w-12 mx-auto mb-2" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Risk Areas Skeleton */}
      <div className="card-professional">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-4 border border-border rounded-md">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>

      {/* Clauses Skeleton */}
      <div className="card-professional">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-border rounded-md overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 border-b border-border">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="px-4 py-3">
                <Skeleton className="h-3 w-32 mb-3" />
                <div className="space-y-2 pl-3 border-l-2 border-muted">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisSkeleton;
