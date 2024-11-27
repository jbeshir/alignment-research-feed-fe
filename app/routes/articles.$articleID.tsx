import type {LoaderFunction, MetaFunction} from "@remix-run/cloudflare";
import {useLoaderData} from "@remix-run/react";
import ArticleTable, {Article} from "~/components/ArticleTable";
import ArticleInfo from "~/components/ArticleInfo";
import TopBar from "~/components/TopBar";
import {Auth0ContextInterface, useAuth0} from "@auth0/auth0-react";
import {AuthenticatedFetch} from "~/utils/request";
import {useEffect, useState} from "react";

export const meta: MetaFunction = () => {
    return [
        { title: "Alignment Feed - Similar Articles" },
        {
            name: "description",
            content: "Similar articles in the alignment research dataset",
        },
    ];
};

type LoaderData = {
    articleID: string;
    apiBaseURL: string;
}

type ArticleDetailsData = {
    article: Article;
    similarArticles: Article[];
}

export const loader: LoaderFunction = async ({ context, params }): Promise<LoaderData> => {
    return {
        articleID: params.articleID,
        apiBaseURL: context.cloudflare.env.ALIGNMENT_FEED_BASE_URL,
    }
};

export default function ArticleDetails() {
    const loaderData = useLoaderData<LoaderData>();
    const auth0Context = useAuth0();

    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<ArticleDetailsData | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const similarArticlesPromise = fetchSimilarArticles(
                loaderData.apiBaseURL,
                auth0Context,
                loaderData.articleID
            );

            const articlePromise = fetchArticle(
                loaderData.apiBaseURL,
                auth0Context,
                loaderData.articleID
            );

            const [article, similarArticles] = await Promise.all([articlePromise, similarArticlesPromise]);

            if (article && similarArticles) {
                setData({
                    article,
                    similarArticles,
                });
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [loaderData, auth0Context]);

    if (isLoading) {
        return (
            <div className='h-screen w-full flex flex-col space-y-4 pb-5'>
                <TopBar/>
                <h2 className='text-1xl text-center font-medium text-black dark:text-white p-5'>Loading...</h2>
            </div>
        );
    }

    if (!data) {
        return (
            <div className='h-screen w-full flex flex-col space-y-4 pb-5'>
                <TopBar/>
                <h2 className='text-1xl text-center font-medium text-black dark:text-white p-5'>No data available</h2>
            </div>
        );
    }

    return (
        <div className='h-screen w-full flex flex-col space-y-4 pb-5'>
            <TopBar/>
            <h2 className='text-3xl text-center font-medium text-black dark:text-white p-5'>
                {data.article.title}
            </h2>
            <div className='px-5'>
                <ArticleInfo
                    article={data.article}
                />
            </div>
            <div className='text-xl font-medium text-black dark:text-white px-5'>
                Articles similar to this one in the dataset.
            </div>
            <div className='grow px-5'>
                <ArticleTable
                    articles={data.similarArticles}
                />
            </div>
            <div className="font-medium text-black dark:text-white pl-5 pb-5">Made with love by <a target="_blank" href="https://beshir.org" className="text-emerald-500 hover:underline">JBeshir</a>.</div>
        </div>
    );
}

async function fetchArticle(
    apiBaseURL: string,
    auth0Context: Auth0ContextInterface,
    articleID: string,
): Promise<Article|null> {
    const apiURL = `${apiBaseURL}/v1/articles/${encodeURIComponent(articleID)}`;
    const response = await AuthenticatedFetch(new Request(apiURL), auth0Context);
    if (!response) {
        return null;
    }

    const data = await response.json();
    return Article.parse(data);
}

async function fetchSimilarArticles(
    apiBaseURL: string,
    auth0Context: Auth0ContextInterface,
    articleID: string,
): Promise<Article[]|null> {

    const apiURL = `${apiBaseURL}/v1/articles/${encodeURIComponent(articleID)}/similar`;
    const req = new Request(apiURL);
    const response = await AuthenticatedFetch(req, auth0Context);
    if (!response) {
        return null;
    }

    if (response.status !== 200) {
        const responseText = await response.text();
        console.log("fetching similar articles: unexpected status code [" + response.status + "]: " + responseText);
        return [];
    }
    const { data, metadata } = await response.json();

    return data.map((item: unknown): Article => {
        if (typeof item !== 'object' || item === null) {
            throw new Error("item is not object")
        }

        return Article.parse(item);
    });
}