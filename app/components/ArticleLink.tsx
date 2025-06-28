import React, { useMemo } from "react";

import { Article } from "~/components/ArticleTable";
import { useAuth0 } from "@auth0/auth0-react";
import { AuthenticatedFetch } from "~/utils/request";
import { useApi } from "~/contexts/ApiContext";

type ArticleLinkProps = {
  article: Article;
  children: React.ReactNode;
  className: string;
};

function ArticleLink({ article, children, className }: ArticleLinkProps) {
  const auth0Context = useAuth0();
  const { baseURL: apiBaseURL } = useApi();
  const markRead = useMemo(() => {
    return async () => {
      if (auth0Context.isAuthenticated) {
        const apiURL = `${apiBaseURL}/v1/articles/${encodeURIComponent(
          article.hash_id
        )}/read/true`;
        const req = new Request(apiURL, { method: "POST" });
        await AuthenticatedFetch(req, auth0Context);
      }
    };
  }, [apiBaseURL, article, auth0Context]);

  if (auth0Context.isLoading) {
    return "";
  }

  return (
    <a
      href={article.link}
      target="_blank"
      rel="noreferrer"
      className={className}
      onClick={markRead}
    >
      {children}
    </a>
  );
}

export default ArticleLink;
