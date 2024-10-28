import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration, useLoaderData,
} from "@remix-run/react";
import "./tailwind.css";
import {Auth0Provider} from "@auth0/auth0-react";
import type {LoaderFunction} from "@remix-run/cloudflare";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
    <head>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96"/>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg"/>
        <link rel="shortcut icon" href="/favicon.ico"/>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
        <link rel="manifest" href="/site.webmanifest"/>
        <Meta/>
        <Links/>
    </head>
    <body className='bg-slate-100 dark:bg-slate-800'>
    {children}
    <ScrollRestoration/>
    <Scripts/>
    </body>
    </html>
  );
}

type LoaderData = {
    auth0Domain: string;
    auth0ClientId: string;
    auth0DefaultRedirectUri: string;
}

export const loader: LoaderFunction = async ({ context }): Promise<LoaderData> => {
    return {
        auth0Domain: context.cloudflare.env.AUTH0_DOMAIN,
        auth0ClientId: context.cloudflare.env.AUTH0_CLIENT_ID,
        auth0DefaultRedirectUri: context.cloudflare.env.AUTH0_DEFAULT_REDIRECT_URI,
    };
};

export default function App() {
    const { auth0Domain, auth0ClientId, auth0DefaultRedirectUri } = useLoaderData<LoaderData>();

    return <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      authorizationParams={{
          redirect_uri: auth0DefaultRedirectUri
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
  >
      <Outlet />
  </Auth0Provider>;
}
