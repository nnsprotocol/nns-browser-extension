# NNS Chrome Extension

![NNS Hero](/assets/hero.jpg)

Welcome to the official Chrome extension for the [Nouns Name Service](https://nns.xyz/).

This extension automatically resolves all addresses shown in [Etherscan](https://etherscan.io) to their associated NNS domain. This feature is something etherscan already does for ENS domains and this extension makes it possible for NNS domains too!

## How do I get it?

You can find the extension on the [Chrome Web Store](https://chrome.google.com/webstore/detail/nouns-name-service-nns/ohbfcjnbjhbpmbafkcladfbblfncmaia).

## How does it work?

The extension is loaded everytime you open etherscan and it searches all addresses shown on the page. Then for each one it performs an NNS lookup as described in [our guide](https://github.com/nnsprotocol/nns-resolver-demo) and updates the page to show the NNS domain.
