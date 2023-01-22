import { ethers } from "ethers";
import { Asset } from "./shared";

export function getOwner(): string | null {
  // https://opensea.io/address
  const [address] = window.location.href.split("/").reverse();
  if (!address) {
    return null;
  }
  if (!ethers.utils.isAddress(address)) {
    return null;
  }
  return address;
}

export function getAsset(): Asset | null {
  const href = document
    .querySelector('a[href*="/assets"]')
    ?.getAttribute("href");
  if (!href) {
    return null;
  }

  const [tokenId, address, chain] = href.split("/").reverse();
  return {
    tokenId,
    address,
    chain,
  };
}

export function updateName(nnsName: string) {
  const h1 = document.querySelector("h1");
  if (!h1) {
    return;
  }
  h1.innerText = nnsName;
}
