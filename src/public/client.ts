import "katex/dist/katex.css";
import { createElement } from "react";
import { CookiesProvider } from "react-cookie";
import ReactDOM from "react-dom";
import { HelmetProvider } from "react-helmet-async";
import { Provider as ReduxProvider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { createStore, StoreEnhancer } from "redux";
import { UniversalApplication } from "../components/app";
import { rootReducer } from "../modules/configureReduxStore";

interface IAugmentedWindow extends Window {
  __PRELOADED_REDUX_DATA__?: StoreEnhancer<{}, {}> | any; // ugh
}
declare const window: IAugmentedWindow;
// https://github.com/parcel-bundler/parcel/issues/314#issuecomment-451423914
if ((module as any).hot) {
  (module as any).hot.dispose(
    () => (window.__PRELOADED_REDUX_DATA__ = store.getState())
  );
}

const preloadedState = window.__PRELOADED_REDUX_DATA__;
const store = createStore(rootReducer, preloadedState);
const appDom = document.getElementById("root");
const appLayout = createElement(UniversalApplication);
const withCookies = createElement(CookiesProvider, undefined, appLayout);
const withRouter = createElement(BrowserRouter, undefined, withCookies);
const withRedux = createElement(ReduxProvider, { store }, withRouter);
const withHelmet = createElement(HelmetProvider, undefined, withRedux);

ReactDOM.hydrate(withHelmet, appDom);
