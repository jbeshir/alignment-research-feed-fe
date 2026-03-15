import { makeUserArticlesProxyLoader } from "~/utils/userArticlesProxy";

export const loader = makeUserArticlesProxyLoader("/v1/articles/liked");
