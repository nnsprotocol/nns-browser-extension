import { Provider } from "@ethersproject/providers";
import { resolveAddresses, ResolvedName } from "../operations/nns-lookup";

// getElementsByAddress finds all elements showing an address that should be looked up against the NNS registry.
// Elements are returned grouped by address as there may be many elements for the same address.
function getElementsByAddress(): Record<string, Element[]> {
  const elements = document.querySelectorAll(".hash-tag[data-original-title]");
  const elementsByAddr: Record<string, Element[]> = {};
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

// updateElements process all addresses and updates all elements
// with the resolved name.
function updateElements(
  elByAddr: Record<string, Element[]>,
  lookups: Record<string, ResolvedName>
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
          if (el.firstElementChild?.tagName.toLowerCase() === "a") {
            const link = el.firstElementChild;
            link.innerHTML = lu.name;
          } else {
            el.innerHTML = lu.name;
          }
          break;
        case "a":
          el.innerHTML = lu.name;
          el.setAttribute("data-original-title", `${lu.name} (${addr})`);
          el.parentElement
            ?.querySelector('img[data-original-title="ENS Name"]')
            ?.remove();
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
