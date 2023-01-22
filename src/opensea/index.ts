import { AlchemyProvider } from "@ethersproject/providers";
import * as profile from "./lookup-profile";
import * as asset from "./lookup-asset";
import lookup from "./shared";

const provider = new AlchemyProvider("homestead", "SET_ALCHEMY_API_KEY");
const lookupInProfile = lookup({
  name: "profile",
  provider,
  ...profile,
});
const lookupInAsset = lookup({
  name: "asset",
  provider,
  ...asset,
});

const target = document.querySelector("title");
let lastTitle = "";
const observer = new MutationObserver(run);
observer.observe(target!, {
  subtree: true,
  characterData: true,
  childList: true,
});

function run() {
  if (document.title === lastTitle) {
    return;
  }
  lastTitle = document.title;

  if (document.title.toLowerCase().includes("profile")) {
    void lookupInProfile();
    return;
  }
  void lookupInAsset();
}
run();
