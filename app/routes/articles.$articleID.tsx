import type {LoaderFunction, MetaFunction} from "@remix-run/cloudflare";
import {useLoaderData} from "@remix-run/react";
import ArticleTable, {Article} from "~/components/ArticleTable";
import ArticleInfo from "~/components/ArticleInfo";
import TopBar from "~/components/TopBar";

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
    article: Article;
    similarArticles: Article[];
}

export const loader: LoaderFunction = async ({ context, params }): Promise<LoaderData> => {
    const apiBaseURL = context.cloudflare.env.ALIGNMENT_FEED_BASE_URL;
    const articleID: string = params.articleID;

    const article = fetchArticle(apiBaseURL, articleID);
    const similarArticles = fetchSimilarArticles(apiBaseURL, articleID);

    return {
        article: await article,
        similarArticles: await similarArticles,
    }
};

export default function ArticleDetails() {
    const loaderData = useLoaderData<LoaderData>();
    const article = Article.parse(loaderData.article);
    const similarArticles = loaderData.similarArticles.map((item: unknown): Article => {
        if (typeof item !== 'object' || item === null) {
            throw new Error("item is not object")
        }

        return Article.parse(item);
    });

    return (
        <div className='h-screen w-full flex flex-col space-y-4 pb-5'>
            <TopBar />
            <h2 className='text-3xl text-center font-medium text-black dark:text-white p-5'>{article.title}</h2>
            <div className='px-5'>
                <ArticleInfo
                    article={article}
                />
            </div>
            <div className='text-xl font-medium text-black dark:text-white px-5'>
                Articles similar to this one in the dataset.
            </div>
            <div className='grow px-5'>
                <ArticleTable
                    articles={similarArticles}
                />
            </div>
        </div>
    );
}

async function fetchArticle(apiBaseURL: string, articleID: string): Promise<Article> {
    const apiURL = `${apiBaseURL}/v1/articles/${encodeURIComponent(articleID)}`;
    const response = await fetch(apiURL);
    const data = await response.json();
    return Article.parse(data);
}

async function fetchSimilarArticles(apiBaseURL: string, articleID: string): Promise<Article[]> {
    const apiURL = `${apiBaseURL}/v1/articles/${encodeURIComponent(articleID)}/similar`;
    const response = await fetch(apiURL);
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