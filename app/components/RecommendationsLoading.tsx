import { Spinner } from "~/components/ui/Spinner";

export function RecommendationsLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 gap-4">
      <Spinner size="lg" />
      <p className="text-slate-600 dark:text-slate-400 text-lg">
        Generating recommendations...
      </p>
    </div>
  );
}
