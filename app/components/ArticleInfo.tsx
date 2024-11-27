import { Article } from "~/components/ArticleTable";

type ArticleInfoProps = {
    article: Article
}

type InfoRowProps = {
    label: string;
    value: React.ReactNode;
}

const InfoRow = ({ label, value }: InfoRowProps) => (
    <div className="h-fill py-2 px-4 flex flex-row bg-slate-200 dark:bg-slate-700">
        <span className="inline-block w-40 font-bold">{label}</span>
        <span className="inline-block grow">{value}</span>
    </div>
);

function ArticleInfo({ article }: ArticleInfoProps) {
    const articleInfo = [
        { label: "Title", value: article.title },
        { label: "Authors", value: article.authors },
        { label: "URL", value: (
            <a target="_blank" href={article.link} rel="noopener noreferrer">
                {article.link}
            </a>
        )},
        { label: "Source", value: article.source },
        { label: "Published At", value: article.published_at.toLocaleString() },
    ];

    return (
        <div className="text-black dark:text-white space-y-2">
            {articleInfo.map((info, index) => (
                <InfoRow key={index} label={info.label} value={info.value} />
            ))}
        </div>
    );
}

export default ArticleInfo;