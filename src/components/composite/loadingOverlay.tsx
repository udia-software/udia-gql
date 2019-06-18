import React from "react";
import styled from "../static/appStyles";
import { Logo } from "../static/logo";

const StyledGridLoadingOverlay = styled.div<IProps>(props => ({
  display: props.loading ? "grid" : "none",
  gridAutoColumns: "auto",
  placeItems: "center",
  placeContent: "center",
  backgroundColor: props.theme.backgroundColor,
  paddingBottom: "1px",
  width: "100%",
  height: "100%",
  opacity: 0.8,
  zIndex: 0,
  gridArea: props.gridArea
}));

interface IProps {
  gridArea: string;
  loading: boolean;
  loadingText?: string;
}

export const LoadingOverlay = (props: IProps) => (
  <StyledGridLoadingOverlay {...props}>
    <Logo isLoading={props.loading} height={66} />
    {!!props.loadingText ? props.loadingText : "Loading..."}
  </StyledGridLoadingOverlay>
);
