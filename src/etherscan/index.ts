import { AlchemyProvider } from "@ethersproject/providers";
import resolveAddresses from "./lookup-address";

const provider = new AlchemyProvider("homestead", "SET_ALCHEMY_API_KEY");

resolveAddresses(provider).run().catch(console.error);
