import {
  type ArticleCollectionProps,
  ArticleCollection,
} from "./ArticleCollection";
import { ArticleCard } from "./ArticleCard";
import { LoadingCard } from "./LoadingCard";

type ArticleGridProps = Omit<
  ArticleCollectionProps,
  | "wrapperClassName"
  | "initialSkeletonCount"
  | "loadMoreSkeletonCount"
  | "ItemComponent"
  | "SkeletonComponent"
>;

export function ArticleGrid(props: ArticleGridProps) {
  return (
    <ArticleCollection
      {...props}
      wrapperClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6"
      initialSkeletonCount={8}
      loadMoreSkeletonCount={4}
      ItemComponent={ArticleCard}
      SkeletonComponent={LoadingCard}
    />
  );
}
