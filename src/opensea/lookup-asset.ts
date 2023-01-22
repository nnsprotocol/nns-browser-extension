import { Asset } from "./shared";

export function getAsset(): Asset | null {
  // https://opensea.io/assets/ethereum/address/tokenId
  const href = window.location.href;
  const [tokenId, address, chain] = href.split("/").reverse();
  if (!tokenId || !address || !chain) {
    return null;
  }
  return {
    tokenId,
    address,
    chain,
  };
}

export function updateName(nnsName: string) {
  // Owned by X
  let ownerLink = document.querySelector(
    'div[data-testid="ItemOwnerAccountLink"] a'
  );
  if (!ownerLink) {
    return;
  }
  ownerLink.innerHTML = nnsName;

  // Description -> By X
  ownerLink = document.querySelector(".item--creator a span");
  if (!ownerLink) {
    return;
  }
  ownerLink.innerHTML = nnsName;
}
