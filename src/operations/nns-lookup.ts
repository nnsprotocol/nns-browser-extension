import { Provider } from "@ethersproject/providers";
import { BigNumber, utils } from "ethers";

export type ResolvedName = {
  name: string | null;
  expiry: number;
};

// resolveAddresses resolves all given addresses and updated the cache.
export async function resolveAddresses(
  provider: Provider,
  addresses: string[]
): Promise<Record<string, ResolvedName>> {
  let cached = await chrome.storage.local.get("lookups");
  const lookups = await Promise.all(
    addresses.map((addr) =>
      resolveAddress(provider, addr, cached?.lookups?.[addr])
    )
  );
  const result: Record<string, ResolvedName> = lookups
    .filter((lu) => !!lu)
    .reduce((acc, [addr, lu]) => ({ ...acc, [addr]: lu }), {});
  await chrome.storage.local.set({ lookups: null });
  return result;
}

// resolveAddress resolves a single address using the cached value if not expired.
async function resolveAddress(
  provider: Provider,
  address: string,
  cachedResult?: ResolvedName
): Promise<[string, ResolvedName]> {
  if (cachedResult?.expiry && Date.now() < cachedResult.expiry) {
    console.log(`[${address}]: cached`);
    return [address, cachedResult];
  }

  const name = await performLookup(provider, address);
  return [
    address,
    {
      name,
      expiry: Date.now() + 60 * 60 * 1000,
    },
  ];
}

// performLookup performs a lookup of the given address and returns the
// associated name or null.
async function performLookup(
  provider: Provider,
  address: string
): Promise<string | null> {
  try {
    console.log(`[${address}]: perform lookup`);
    const res = await provider.call({
      to: "0x849f92178950f6254db5d16d1ba265e70521ac1b",
      data: "0x55ea6c47000000000000000000000000" + address.substring(2),
    });
    const offset = BigNumber.from(utils.hexDataSlice(res, 0, 32)).toNumber();
    const length = BigNumber.from(
      utils.hexDataSlice(res, offset, offset + 32)
    ).toNumber();
    const data = utils.hexDataSlice(res, offset + 32, offset + 32 + length);
    return utils.toUtf8String(data) || null;
  } catch (e) {
    console.error(`[${address}]: lookup error`, e);
    return null;
  }
}
