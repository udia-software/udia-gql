import { Location } from "history";
import React from "react";
import { Helmet } from "react-helmet-async";
import { connect } from "react-redux";
import { Route, RouteComponentProps, Switch, withRouter } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { About } from "./pages/about";
import { Contact } from "./pages/contact";
import { Home } from "./pages/home";
import { LogIn } from "./pages/logIn";
import { NotFound } from "./pages/notFound";
import { PageWrapper } from "./pages/pageWrapper";
import { SignOut } from "./pages/signOut";
import { SignUp } from "./pages/signUp";
import styled, { DarkTheme, IThemeInterface, LightTheme, ThemeProvider } from "./static/appStyles";
import "./static/fontAwesomeIcons";

const ElemLayout = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  color: ${({ theme }) => theme.primaryColor};
`;

interface IState {
  theme: IThemeInterface;
}

class ApplicationLayout extends React.PureComponent<RouteComponentProps, IState> {
  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      theme: DarkTheme
    };
  }

  public render() {
    return (
      <ThemeProvider theme={this.state.theme}>
        <ElemLayout>
          <Helmet>
            <title>UDIA</title>
            <meta name="description" content="Universal Dream Infinite Awareness" />
          </Helmet>
          <Route
            render={(props: { location: Location }) => (
              <TransitionGroup
                className="relative-transition-group"
                component={PageWrapper}
                toggleTheme={this.toggleTheme}>
                <CSSTransition
                  key={props.location.key}
                  classNames="page-fade"
                  timeout={200}
                >
                  <Switch key={props.location.key} location={props.location}>
                    <Route path="/" exact component={Home} />
                    <Route path="/about" exact component={About} />
                    <Route path="/contact" exact component={Contact} />
                    <Route path="/sign-up" exact component={SignUp} />
                    <Route path="/log-in" exact component={LogIn} />
                    <Route path="/sign-out" exact component={SignOut} />
                    <Route component={NotFound} />
                  </Switch>
                </CSSTransition>
              </TransitionGroup>
            )}
          />
        </ElemLayout>
      </ThemeProvider>
    );
  }

  protected toggleTheme = () => {
    this.setState(({ theme }) => ({ theme: theme === DarkTheme ? LightTheme : DarkTheme }));
  }
}

// connect with Router for reloading on location change
const mapStateToProps = () => ({});
const ConnectedApplicationLayout = withRouter(connect(mapStateToProps)(ApplicationLayout));
export { ConnectedApplicationLayout as ApplicationLayout };
