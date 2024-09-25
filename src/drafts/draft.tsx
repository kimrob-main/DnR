import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";
import { WagmiConfig, useAccount, useBalance } from "wagmi";
import { mainnet, polygon, optimism, arbitrum } from "wagmi/chains";
import { ethers } from "ethers";
import "./index.css";

const projectId = import.meta.env.VITE_APP_WALLET_CONNECT;

const chains = [mainnet, polygon, optimism, arbitrum];

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  appName: "Web3Modal v3",
});

createWeb3Modal({ wagmiConfig, projectId, chains });

const App = () => {
  const { address } = useAccount();
  const  allchains  = chains;
  const [balances, setBalances] = useState<{ chain: string; balance: string }[]>([]);

  const fetchBalances = async (address:any, allchains:any)=>{
    console.log(address)
    console.log(allchains)

    if (!address) return;
    console.log(address)
  
    let chainBalances: { chain: string; balance: string }[] = [];
  
    for (const chain of allchains) {
      try {
        const  balanceData  = useBalance({
          address: address,
          // chainId: chain.id,
        });
  
        if (balanceData) {
          chainBalances.push({
            chain: chain.name,
            balance: ethers.utils.formatEther(balanceData.value),
          });
          console.log(balanceData.value.toString());
        }
      } catch (error) {
        console.error(`Failed to fetch balance for chain ${chain.name}:`, error);
      }
    }
  
    // Sort balances from highest to lowest
    chainBalances.sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));
    console.log(chainBalances)
    setBalances(chainBalances);
  }
  useEffect(() => {
   

  }, [address]);

  return (
    <>
      <div className="container">
        <w3m-button />
        <w3m-network-button />
      </div>
      <p>
        {address && (
          <>
            <b>Address:</b> {address}
          </>
        )}
      </p>
      <div>
        <button onClick={()=>fetchBalances(address, allchains) }>Balances:</button>
        <ul>
          {balances.map((balance, index) => (
            <li key={index}>
              {balance.chain}: {balance.balance} ETH
            </li>
          ))}
        </ul>
      </div>
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
