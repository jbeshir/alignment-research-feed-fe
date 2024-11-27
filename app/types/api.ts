import { Article } from "~/components/ArticleTable";

export type ArticlesResponse = {
    data: Article[];
    metadata: Record<string, unknown>;
};
