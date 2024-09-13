import {json, LoaderFunctionArgs, type LoaderFunction, type MetaFunction} from "@remix-run/cloudflare";
import {useLoaderData} from "@remix-run/react";
import Navigation from '~/components/Navigation';

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

export const loader: LoaderFunction = async ({ context } : LoaderFunctionArgs): Promise<LoaderData> => {
  const url: string = import.meta.env.VITE_ALIGNMENT_FEED_BASE_URL;
  return { apiBaseURL: url };
  //return { apiBaseURL: context.cloudflare.env.ALIGNMENT_FEED_BASE_URL};
};

export default function Index() {
  const apiBaseURL: string = import.meta.env.VITE_ALIGNMENT_FEED_BASE_URL;//useLoaderData<LoaderData>();

  return (
    <Navigation apiBaseURL={apiBaseURL} />
  );
}