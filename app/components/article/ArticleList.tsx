import {
  type ArticleCollectionProps,
  ArticleCollection,
} from "./ArticleCollection";
import { ArticleRow } from "./ArticleRow";
import { LoadingRow } from "./LoadingRow";

type ArticleListProps = Omit<
  ArticleCollectionProps,
  | "wrapperClassName"
  | "initialSkeletonCount"
  | "loadMoreSkeletonCount"
  | "ItemComponent"
  | "SkeletonComponent"
>;

export function ArticleList(props: ArticleListProps) {
  return (
    <ArticleCollection
      {...props}
      wrapperClassName="flex flex-col gap-4 p-6"
      initialSkeletonCount={5}
      loadMoreSkeletonCount={3}
      ItemComponent={ArticleRow}
      SkeletonComponent={LoadingRow}
    />
  );
}
