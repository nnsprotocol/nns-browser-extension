import log from "../operations/log";
import { resolveAddresses } from "../operations/nns-lookup";
import { Provider } from "@ethersproject/abstract-provider";

export type Asset = {
  address: string;
  chain: string;
  tokenId: string;
};

type Config = {
  name: string;
  provider: Provider;
  getOwner?: () => string | null;
  getAsset: () => Asset | null;
  updateName: (nnsName: string) => void;
};

// getOwnerAddress returns the owner's address for the given wallet.
async function getOwnerAddress(asset: Asset): Promise<string | null> {
  if (asset.chain !== "ethereum") {
    return null;
  }

  try {
    const res = await fetch(
      `https://api.opensea.io/api/v1/asset/${asset.address}/${asset.tokenId}/owners`
    );
    const body = await res.json();
    return body.owners[0]?.owner?.address;
  } catch (e) {
    console.error("error fetching owner", e);
    return null;
  }
}

export default function lookup(cfg: Config): () => Promise<void> {
  return async () => {
    let owner = cfg.getOwner?.() ?? null;
    if (!owner) {
      const asset = cfg.getAsset();
      if (!asset) {
        log(cfg.name, "no asset");
        return;
      }
      log(cfg.name, "asset found", asset);
      owner = await getOwnerAddress(asset);
    }
    if (!owner) {
      log(cfg.name, "no owner");
      return;
    }

    log(cfg.name, "owner found", owner);

    const lookups = await resolveAddresses(cfg.provider, [owner]);
    const name = lookups[owner];
    if (!name?.name) {
      log(cfg.name, "lookup not found");
      return;
    }
    log(cfg.name, "found name", name.name);
    cfg.updateName(name.name);
  };
}
