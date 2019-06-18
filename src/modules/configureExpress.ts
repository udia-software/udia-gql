import bodyParser from "body-parser";
import compression from "compression";
import express from "express";
import { createReadStream } from "fs";
import { join } from "path";
import { createElement } from "react";
import { getDataFromTree } from "react-apollo";
import { Cookies, CookiesProvider } from "react-cookie";
import { renderToNodeStream } from "react-dom/server";
import { FilledContext, HelmetProvider } from "react-helmet-async";
import { Provider } from "react-redux";
import { StaticRouter } from "react-router";
import { createStore } from "redux";
import { StreamInjector } from "stream-inject";
import { ServerStyleSheet } from "styled-components";
import cookiesMiddleware from "universal-cookie-express";
import { ApplicationLayout } from "../components/layout";
import { NODE_ENV } from "../constants";
import UserManager from "../managers/userManager";
import Auth from "./auth";
import { IRootState, rootReducer } from "./configureReduxStore";

const PUBLIC_PATH_DIR = join(__dirname, "..", "public");
export const app = express();
app.use(compression());

// Application Meta
app.disable("x-powered-by");
app.set("trust proxy", true);

// Robots are allowed to crawl
app.get("/robots.txt", (_, res) => {
  res.set("Content-Type", "text/plain");
  res.send("User-agent: *\nDisallow:\n");
});

// Serve static files from Public folder
app.use(
  "/",
  express.static(PUBLIC_PATH_DIR, {
    index: false,
    cacheControl: true,
    immutable: true,
    maxAge: 31536000000 // 60 sec * 60 min * 24 hour * 365 day * 1000 ms
  })
);

app.use(cookiesMiddleware());
const JWT_COOKIE_OPTS = {
  path: "/",
  secure: NODE_ENV === "production",
  sameSite: true,
  httpOnly: true
};

// handle httpOnly cookies for jwt callback
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.post("/resource/jwt", async (req, res) => {
  const cookies: Cookies = (req as any).universalCookies;
  const jwt: string | undefined = req.body.jwt;
  let uuid: string | undefined;
  if (jwt) {
    uuid = Auth.verifyUserJWT(jwt).uuid;
  }
  if (uuid) {
    cookies.set("jwt", jwt, JWT_COOKIE_OPTS);
  } else {
    cookies.remove("jwt", JWT_COOKIE_OPTS);
  }
  res.json({ authenticated: !!uuid });
});

app.get("/*", async (req, res) => {
  res.type("html");

  // Initialize Empty Redux Store & State
  let store = createStore(rootReducer);
  const reduxState: IRootState = store.getState();

  // Check if user is authenticated
  const cookies: Cookies = (req as any).universalCookies;
  const jwt: string | undefined = cookies.get("jwt");
  if (jwt) {
    const { uuid } = Auth.verifyUserJWT(jwt);
    if (uuid) {
      // get the username
      const { username } = await UserManager.seedCookiePayload(uuid);
      // re-create the store with preloaded user data
      reduxState.userUniversal.userId = uuid;
      reduxState.userUniversal.username = username;
      store = createStore(rootReducer, reduxState);
    } else {
      // invalid JWT supplied, clear it
      cookies.remove("jwt", JWT_COOKIE_OPTS);
    }
  }

  // React Helmet SSR Context stub
  const helmetContext: FilledContext | {} = {};

  // Construct JSX (No shorthand)
  const appLayout = createElement(ApplicationLayout);
  const withCookies = createElement(CookiesProvider, { cookies }, appLayout);
  const withRouter = createElement(
    StaticRouter,
    { context: {}, location: req.url },
    withCookies
  );
  const withRedux = createElement(Provider, { store }, withRouter);
  const withHelmet = createElement(
    HelmetProvider,
    { context: helmetContext },
    withRedux
  );

  // Server Side Rendering with Stylesheet and Node Stream
  const styleSheet = new ServerStyleSheet();
  const jsx = styleSheet.collectStyles(withHelmet);
  await getDataFromTree(jsx); // Populate Helmet SSR Context stub
  const appStream = styleSheet.interleaveWithNodeStream(
    renderToNodeStream(jsx)
  );

  // Begin html streaming
  const rawHTMLStream = createReadStream(join(PUBLIC_PATH_DIR, "index.html"));
  rawHTMLStream
    .pipe(new StreamInjector("{body}", appStream))
    .pipe(
      new StreamInjector(
        "{helmetData}",
        (helmetContext as FilledContext).helmet
          ? (helmetContext as FilledContext).helmet.title.toString() +
            (helmetContext as FilledContext).helmet.meta.toString()
          : ""
      )
    )
    .pipe(
      new StreamInjector(
        "{reduxStateCode}",
        "<script>window.__PRELOADED_REDUX_DATA__= " +
          JSON.stringify(reduxState).replace(/</g, "\\u003c") +
          "</script>"
      )
    )
    .pipe(res);
});
