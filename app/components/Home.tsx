import AlignmentFeedTable from "~/components/AlignmentFeedTable";
import Navigation from "~/components/Navigation";

export default function Home(apiUrl:any) {
    return (
        <>
        <div className='h-screen w-full flex flex-col space-y-4 pb-5'>
            <h1 className='text-5xl text-center font-medium text-black dark:text-white p-5'>Alignment Feed</h1>
            <div className='text-xl font-medium text-black dark:text-white px-5'>
                A feed of all content in the <a href='https://github.com/StampyAI/alignment-research-dataset' className='text-emerald-500 hover:underline'>Alignment Research Dataset</a>,
                updated every day.
            </div>
            <div className='grow px-5'>
                <AlignmentFeedTable apiBaseURL={apiUrl}/>
            </div>
            <div className='text-xl font-medium text-black dark:text-white px-5'>
                An RSS feed of new items coming into this dataset is available <a href='https://alignmentfeed.beshir.org/rss' className='text-emerald-500 hover:underline'>here</a>.
            </div>
        </div>

        <Navigation />
        </>
    );
}

