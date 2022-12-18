import { Provider } from "@ethersproject/providers";
import { BigNumber, utils } from "ethers";

type Address = string;

type ResolvedName = {
  name: string | null;
  expiry: number;
};

// getElementsByAddress finds all elements showing an address that should be looked up against the NNS registry.
// Elements are returned grouped by address as there may be many elements for the same address.
function getElementsByAddress(): Record<Address, Element[]> {
  const elements = document.querySelectorAll(".hash-tag[data-original-title]");
  const elementsByAddr: Record<Address, Element[]> = {};
  for (const el of elements) {
    const ref =
      el.getAttribute("href") ||
      el.getAttribute("data-original-title") ||
      el.innerHTML;
    const maybeMatch = ref.match(/0x[abcdef0-9]{40}$/i);
    if (!maybeMatch?.[0]) {
      continue;
    }
    const addr = maybeMatch?.[0];
    elementsByAddr[addr] = (elementsByAddr[addr] || []).concat(el);
  }
  return elementsByAddr;
}

// resolveAddresses resolves all given addresses and updated the cache.
async function resolveAddresses(
  provider: Provider,
  addresses: Address[]
): Promise<Record<Address, ResolvedName>> {
  let cached = await chrome.storage.local.get("lookups");
  const lookups = await Promise.all(
    addresses.map((addr) =>
      resolveAddress(provider, addr, cached?.lookups?.[addr])
    )
  );
  const result: Record<Address, ResolvedName> = lookups
    .filter((lu) => !!lu)
    .reduce((acc, [addr, lu]) => ({ ...acc, [addr]: lu }), {});
  await chrome.storage.local.set({ lookups: result });
  return result;
}

// resolveAddress resolves a single address using the cached value if not expired.
async function resolveAddress(
  provider: Provider,
  address: string,
  cachedResult?: ResolvedName
): Promise<[Address, ResolvedName]> {
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
  address: Address
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

// updateElements process all addresses and updates all elements
// with the resolved name.
function updateElements(
  elByAddr: Record<Address, Element[]>,
  lookups: Record<Address, ResolvedName>
) {
  for (const [addr, lu] of Object.entries(lookups)) {
    if (!lu.name) {
      continue;
    }
    const elements = elByAddr[addr];
    if (!elements) {
      continue;
    }
    for (const el of elements) {
      switch (el.tagName.toLowerCase()) {
        case "span":
          el.innerHTML = lu.name;
          break;
        case "a":
          el.innerHTML = lu.name;
          el.setAttribute("data-original-title", `${lu.name} (${addr})`);
          break;
      }
    }
  }
}

export default function (provider: Provider) {
  return {
    async run() {
      const elementsByAddr = getElementsByAddress();
      const lookupAddresses = await resolveAddresses(
        provider,
        Object.keys(elementsByAddr)
      );
      updateElements(elementsByAddr, lookupAddresses);
    },
  };
}
