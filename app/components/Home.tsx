import AlignmentFeedTable from "~/components/AlignmentFeedTable";

export default function Home({ apiBaseURL, darkMode }: { apiBaseURL: string, darkMode:string }) {
    return (
        <>
            <div className='h-screen w-full flex flex-col space-y-4 pb-5 pt-3'>
                <div className='text-xl font-medium text-black dark:text-white px-5'>
                    A feed of all content in the <a href='https://github.com/StampyAI/alignment-research-dataset' className='text-emerald-500 hover:underline'>Alignment Research Dataset</a>,
                    updated every day.
                </div>
                <div className='grow px-5'>
                    <AlignmentFeedTable apiBaseURL={apiBaseURL} darkMode={darkMode}/>
                </div>
                <div className='text-xl font-medium text-black dark:text-white px-5'>
                    An RSS feed of new items coming into this dataset is available <a href='https://alignmentfeed.beshir.org/rss' className='text-emerald-500 hover:underline'>here</a>.
                </div>
            </div>
        </>
    );
}

