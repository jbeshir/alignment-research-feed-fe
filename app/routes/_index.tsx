import type {LoaderFunction, MetaFunction} from "@remix-run/cloudflare";
import {useLoaderData} from "@remix-run/react";
import AlignmentFeedTable from "~/components/AlignmentFeedTable";
import TopBar from "~/components/TopBar";

export const meta: MetaFunction = () => {
  return [
    { title: "Alignment Feed" },
    {
      name: "description",
      content: "Feed of content in the alignment research dataset",
    },
  ];
};

type LoaderData = {
  apiBaseURL: string;
}

export const loader: LoaderFunction = async ({ context }): Promise<LoaderData> => {
  return { apiBaseURL: context.cloudflare.env.ALIGNMENT_FEED_BASE_URL};
};

export default function Index() {
  const { apiBaseURL } = useLoaderData<LoaderData>();

  return (
      <div className='h-screen w-full flex flex-col space-y-4 pb-5'>
        <TopBar />
        <div className='text-xl font-medium text-black dark:text-white px-5'>
          A feed of all content in the <a href='https://github.com/StampyAI/alignment-research-dataset' className='text-emerald-500 hover:underline'>Alignment Research Dataset</a>,
          updated every day.
        </div>
        <div className='grow px-5'>
          <AlignmentFeedTable
              apiBaseURL={apiBaseURL}
          />
        </div>
        <div className='text-xl font-medium text-black dark:text-white px-5'>
          An RSS feed of new items coming into this dataset is available <a href='https://alignmentfeed.beshir.org/rss' className='text-emerald-500 hover:underline'>here</a>.
        </div>
      </div>
  );
}