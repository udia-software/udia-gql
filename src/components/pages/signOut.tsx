import React, { Component, FormEventHandler } from "react";
import { Helmet } from "react-helmet-async";
import { connect } from "react-redux";
import { Form, FormFieldset, SubmitButton } from "../static/formHelpers";
import { Center, H1 } from "../static/themedHelpers";

class SignOutController extends Component<{}> {
  constructor(props: {}) {
    super(props);
  }

  public render() {
    // const { user } = this.props;
    // if (!user) {
    //   if (!this.isRedirecting) {
    //     this.isRedirecting = true;
    //     return <Redirect to="/" />;
    //   }
    // }

    return (<Center>
      <Helmet>
        <title>Sign Out - UDIA</title>
        <meta name="description" content="Sign out of UDIA, User." />
      </Helmet>
      <H1>Sign Out</H1>
      <Form autoComplete="off" method="post" onSubmit={this.handleSubmit}>
        <FormFieldset>
          {/* <FormLegend>Leaving, {user ? user.getUsername() : "User"}?</FormLegend> */}
          <SubmitButton type="submit" children={"Sign Out"} />
        </FormFieldset>
      </Form>
    </Center>);
  }

  protected handleSubmit: FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault();
  }
}

const mapStateToProps = () => ({});

const SignOut = connect(mapStateToProps)(SignOutController);

export { SignOut };
