import type {LoaderFunction, MetaFunction} from "@remix-run/cloudflare";
import {useLoaderData} from "@remix-run/react";
import ArticleTable, {Article} from "~/components/ArticleTable";

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
    similarArticles: Article[];
}

export const loader: LoaderFunction = async ({ context, params }): Promise<LoaderData> => {
    const apiBaseURL = context.cloudflare.env.ALIGNMENT_FEED_BASE_URL;
    const articleID: string = params.articleID;

    const apiURL = `${apiBaseURL}/v1/articles/${encodeURIComponent(articleID)}/similar`;
    const response = await fetch(apiURL);
    const { data, metadata } = await response.json();

    const similarArticles = data.map((item: unknown): Article => {
        if (typeof item !== 'object' || item === null) {
            throw new Error("item is not object")
        }

        return Article.parse(item);
    });

    return { similarArticles: similarArticles};
};

export default function ArticleDetails() {
    const loaderData = useLoaderData<LoaderData>();
    const similar = loaderData.similarArticles.map((item: unknown): Article => {
        if (typeof item !== 'object' || item === null) {
            throw new Error("item is not object")
        }

        return Article.parse(item);
    });

    return (
        <div className='h-screen w-full flex flex-col space-y-4 pb-5'>
            <h1 className='text-5xl text-center font-medium text-black dark:text-white p-5'>Alignment Feed</h1>
            <div className='text-xl font-medium text-black dark:text-white px-5'>
                Articles similar to the selected article in the dataset.
            </div>
            <div className='grow px-5'>
                <ArticleTable
                    articles={similar}
                />
            </div>
        </div>
    );
}