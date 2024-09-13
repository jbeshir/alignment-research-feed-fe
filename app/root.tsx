import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import "./tailwind.css";
import { Auth0Provider } from '@auth0/auth0-react';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.0/font/bootstrap-icons.css"/>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet" />
      </head>
      <body className="bg-slate-100 dark:bg-slate-800">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const domain = import.meta.env.VITE_DOMAIN;
  const clientID = import.meta.env.VITE_CLIENT_ID;
  const redirect_uri = import.meta.env.VITE_REDIRECT_URI;
  
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientID}
      authorizationParams={{redirect_uri: redirect_uri}}>
      <Outlet />
    </Auth0Provider>
  );
  //return <Outlet />;
}
