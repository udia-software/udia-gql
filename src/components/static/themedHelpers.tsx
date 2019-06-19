import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link as rrLink } from "react-router-dom";
import styled, { IThemeInterface } from "./appStyles";

// Themed Links
const LinkCSS = ({ theme }: { theme: IThemeInterface }) => ({
  cursor: "pointer",
  transition: "color 0.1s ease-in",
  textDecoration: "none",
  color: theme.intermediateColor,
  "&:hover": {
    color: theme.primaryColor
  }
});
export const Link = styled(rrLink)(LinkCSS);
export const A = styled.a(LinkCSS);

// Themed Headers
export interface IWithGridArea {
  gridArea?: string;
}
const HeaderCSS = ({ gridArea }: IWithGridArea) => ({
  gridArea,
  padding: 0,
  margin: "0 0 0.3em 0"
});
export const H1 = styled.h1<IWithGridArea>(HeaderCSS);
export const H2 = styled.h2<IWithGridArea>(HeaderCSS);
export const H3 = styled.h3<IWithGridArea>(HeaderCSS);
export const H4 = styled.h4<IWithGridArea>(HeaderCSS);
export const H5 = styled.h5<IWithGridArea>(HeaderCSS);
export const H6 = styled.h6<IWithGridArea>(HeaderCSS);

// Centered Content
export const Center = styled.div<{ gridTemplateAreas?: string }>(
  ({ gridTemplateAreas }) => ({
    width: "100%",
    height: "100%",
    display: "grid",
    gridTemplateAreas,
    placeContent: "center",
    placeItems: "center",
    textAlign: "center"
  })
);

// Colored Icons
export const GreenIcon = styled(FontAwesomeIcon)(({ theme }) => ({
  color: theme.green
}));
export const RedIcon = styled(FontAwesomeIcon)(({ theme }) => ({
  color: theme.red
}));
export const YellowIcon = styled(FontAwesomeIcon)(({ theme }) => ({
  color: theme.yellow
}));

// Wrapping preformat code blocks
export const Pre = styled.pre`
white-space: pre-wrap;       /* css-3 */
white-space: -moz-pre-wrap;  /* Mozilla, since 1999 */
white-space: -pre-wrap;      /* Opera 4-6 */
white-space: -o-pre-wrap;    /* Opera 7 */
word-wrap: break-word;       /* Internet Explorer 5.5+ */
`;

// Extending Katex block display mode
export const KatexBlock = styled.span`
.katex-display > .katex {
  overflow-x: visible;
  overflow-y: hidden;
}`;
