import { render } from "preact";
import "./styles.css";
import { ensureLabelFonts } from "./render/fonts";
import { fontsVersion } from "./state";
import { App } from "./ui/App";

render(<App />, document.getElementById("app")!);

ensureLabelFonts().then(() => {
  fontsVersion.value += 1;
});
document.fonts?.addEventListener("loadingdone", () => {
  fontsVersion.value += 1;
});
