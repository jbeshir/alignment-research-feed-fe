import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import "./tailwind.css";
import { Auth0Provider } from "@auth0/auth0-react";
import type { LoaderFunction } from "@remix-run/cloudflare";
import React from "react";
import { ApiProvider } from "~/contexts/ApiContext";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          type="image/png"
          href="/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <Meta />
        <Links />
      </head>
      <body className="bg-slate-100 dark:bg-slate-800">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

type LoaderData = {
  auth0Domain: string;
  auth0Audience: string;
  auth0ClientId: string;
  auth0DefaultRedirectUri: string;
  apiBaseURL: string;
};

export const loader: LoaderFunction = async ({
  context,
}): Promise<LoaderData> => {
  return {
    auth0Domain: context.cloudflare.env.AUTH0_DOMAIN,
    auth0Audience: context.cloudflare.env.AUTH0_AUDIENCE,
    auth0ClientId: context.cloudflare.env.AUTH0_CLIENT_ID,
    auth0DefaultRedirectUri: context.cloudflare.env.AUTH0_DEFAULT_REDIRECT_URI,
    apiBaseURL: context.cloudflare.env.ALIGNMENT_FEED_BASE_URL,
  };
};

export default function App() {
  const {
    auth0Domain,
    auth0Audience,
    auth0ClientId,
    auth0DefaultRedirectUri,
    apiBaseURL,
  } = useLoaderData<LoaderData>();

  return (
    <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      authorizationParams={{
        redirect_uri: auth0DefaultRedirectUri,
        audience: auth0Audience,
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      <ApiProvider baseURL={apiBaseURL}>
        <Outlet />
      </ApiProvider>
    </Auth0Provider>
  );
}
