import React, {useMemo} from "react";

import {Article} from "~/components/ArticleTable";
import {Auth0ContextInterface} from "@auth0/auth0-react";
import {AuthenticatedFetch} from "~/utils/request";

type ArticleLinkProps = {
    apiBaseURL: string;
    auth0Context: Auth0ContextInterface;
    article: Article
    children: React.ReactNode;
    className: string;
}

function ArticleLink({apiBaseURL, auth0Context, article, children, className}: ArticleLinkProps) {
    const markRead = useMemo(
        () => {
            return async (e: React.MouseEvent) => {
                if (auth0Context.isAuthenticated) {
                    const apiURL = `${apiBaseURL}/v1/articles/${encodeURIComponent(article.hash_id)}/read/true`;
                    const req = new Request(apiURL, {method: 'POST'});
                    await AuthenticatedFetch(req, auth0Context);
                }
            }
        },
        [apiBaseURL, article, auth0Context]
    );

    if (auth0Context.isLoading) {
        return "";
    }

    return (
        <a href={article.link} target='_blank' rel='noreferrer' className={className} onClick={markRead}>
            {children}
        </a>
    );
}

export default ArticleLink;
