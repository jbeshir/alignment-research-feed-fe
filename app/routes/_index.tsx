import type {LoaderFunction, MetaFunction} from "@remix-run/cloudflare";
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

export const loader: LoaderFunction = async ({ context }): Promise<LoaderData> => {
  return { apiBaseURL: context.cloudflare.env.ALIGNMENT_FEED_BASE_URL};
};

export default function Index() {
  const { apiBaseURL } = useLoaderData<LoaderData>();

  return (
    <Navigation apiUrl={apiBaseURL} />
  );
}