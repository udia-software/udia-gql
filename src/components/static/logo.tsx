import React from "react";
import styled from "./appStyles";

interface ILogoProps {
  width?: number;
  height?: number;
}

const StyledSVG = styled.svg.attrs<ILogoProps>({})`
  fill: ${({ theme }) => theme.primaryColor};
  color: ${({ theme }) => theme.primaryColor};
`;

const LEFT_BRACKET_POLY = [
  "38.182,57.753",
  "20.18,47.91",
  "20.18,42.455",
  "38.182,32.652",
  "38.182,39.074",
  "25.625,45.113",
  "38.182,51.379"
].join(" ");

const SLASH_POLY = [
  "39.848,62.08",
  "46.351,27.918",
  "50.136,27.918",
  "43.56,62.08"
].join(" ");

const RIGHT_BRACKET_POLY = [
  "51.8,57.78",
  "51.8,51.4",
  "64.372,45.181",
  "51.8,39.028",
  "51.8,32.696",
  "69.82,42.5",
  "69.82,47.91"
].join(" ");

const HEXAGON_PATH = [
  "M44.999,86.031",
  "L9.465,65.517",
  "V24.484",
  "L44.999,3.969",
  "l35.536,20.516",
  "v41.029",
  "L44.999,86.031",
  "Z",
  "M13.07,63.434",
  "l31.929,18.434",
  "L76.93,63.434",
  "V26.566",
  "L44.999,8.131",
  "L13.07,26.565",
  "V63.434",
  "L13.07,63.434",
  "Z"
].join("");

const Logo = (props: ILogoProps) => {
  const base = [ 114 ]; // minimum height is 114 px;
  const { width, height } = props;
  if (width) { base.push(width); }
  if (height) { base.push(height); }
  const side = Math.max(...base);
  return (
    <StyledSVG width={side} height={side} viewBox="0 0 90 90" x="0" y="0">
      <polygon points={LEFT_BRACKET_POLY} />
      <polygon points={SLASH_POLY} />
      <polygon points={RIGHT_BRACKET_POLY} />
      <path d={HEXAGON_PATH} />
    </StyledSVG>
  );
};

export { Logo };
