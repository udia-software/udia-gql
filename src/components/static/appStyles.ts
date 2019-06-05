import * as s from "styled-components";

interface IThemeInterface {
  backgroundColor: string;
  primaryColor: string;
  inverseColor: string;
  intermediateColor: string;
  inputBaseBackgroundColor: string;
  pulse: s.Keyframes;
  purple: string; // focus, user interaction
  red: string; // errors
  yellow: string; // warnings
  green: string; // success
}

const { default: styled, css, keyframes } = s;
const ThemeProvider: React.ComponentClass<
  s.ThemeProviderProps<IThemeInterface, IThemeInterface>> = s.ThemeProvider;

const DarkTheme: IThemeInterface = {
  backgroundColor: "#000000",
  primaryColor: "hsla(0, 0%, 100%, 1)",
  intermediateColor: "hsla(0, 0%, 100%, 0.6)",
  inverseColor: "hsla(0, 0%, 0%, 1)",
  inputBaseBackgroundColor: "hsla(0, 0%, 100%, 0.95)",
  pulse: keyframes`
    0% { fill: hsla(0, 0%, 100%, 0); }
    80% { fill: hsla(0, 0%, 100%, 1); }
    100% { fill: hsla(0, 0%, 100%, 8); }
  `,
  purple: "#663399", // Rebecca Purple
  red: "#FF595E",    // Sunset Orange
  yellow: "#FFCA3A", // Sunglow
  green: "#7FB069",  // Asparagus
};

const LightTheme: IThemeInterface = {
  backgroundColor: "#ffffff",
  primaryColor: "hsla(0, 0%, 0%, 1)",
  intermediateColor: "hsla(0, 0%, 0%, 0.6)",
  inverseColor: "hsla(0, 0%, 100%, 1)",
  inputBaseBackgroundColor: "hsla(0, 0%, 0%, 0.05)",
  pulse: keyframes`
    0% { fill: hsla(0, 0%, 0%, 0); }
    80% { fill: hsla(0, 0%, 0%, 1); }
    100% { fill: hsla(0, 0%, 0%, 8); }
  `,
  purple: "#663399", // Rebecca Purple
  red: "#FF595E",    // Sunset Orange
  yellow: "#FFCA3A", // Sunglow
  green: "#7FB069",  // Asparagus
};

export default styled as s.ThemedBaseStyledInterface<IThemeInterface>;
export { IThemeInterface, css, ThemeProvider, DarkTheme, LightTheme };
