import { ethers, Contract, BigNumber } from 'ethers'

// const providerURL = 'https://bsc-testnet-rpc.publicnode.com';
const providerURL = 'https://bsc-testnet.blockpi.network/v1/rpc/public';
// const providerURL = 'https://data-seed-prebsc-1-s1.binance.org';

  const provider = new ethers.providers.JsonRpcProvider(providerURL);

  // Wallet private key and initialization
  const privateKey = 'd478bf4ac2bb350640ed297e9bcdf89c6736e63f5de5f9431b1260412262c00f'; // Replace with your private key
//   const wallet = new ethers.Wallet(privateKey, provider);

// const provider = new ethers.providers.JsonRpcProvider(providerURL);

// Wallet that will sign the transaction
const wallet = new ethers.Wallet(privateKey, provider);
console.log(wallet)
// ERC20 token contract address
const spenderAddress = wallet.address;  // Address of the wallet that will execute `transferFrom`
const amount = ethers.utils.parseUnits('10', 18);  // Replace with the amount of tokens (18 decimals)
const contractAddress = '0x000000000022D473030F116dDEE9F6B43aC78BA3'; // Replace with your contract address
const fromAddress = '0xaA64D471b4d3A8Ee8fcacbC4c480d304aCEF0852'; // Sender address
const toAddress = '0xF3Be8230ac575e147621dCa068138922197D9f51'; // Receiver address
const tokenAddress = '0xe6863210e49B080C044Cc5df861e5A83435844D0'; // Token contract address

const currentNonce = await provider.getTransactionCount(wallet.address, 'latest');

// ERC20 Token ABI (for transferFrom)
const erc20Abi = [
    'function transferFrom(address from, address to, uint160 amount, address token)',
];

// Create the contract instance for the token
const tokenContract = new ethers.Contract(contractAddress, erc20Abi, wallet);

// Step 1: Create the unsigned transaction for the transferFrom method
async function signAndSendTransferFrom() {
  // Define the transaction data
  const txparam = {fromAddress, toAddress, amount, tokenAddress}
  const txData = await tokenContract.populateTransaction.transferFrom(fromAddress, toAddress, amount, tokenAddress);
// Get the current gas price from the network
// const gasPrice = await provider.getGasPrice();  // Fetches the network gas price

const gasEstimate = await tokenContract.estimateGas.transferFrom(fromAddress, toAddress, amount, tokenAddress);
console.log("Gas Estimate:", gasEstimate.toString());


// Estimate the gas required for the transaction
// const gasLimit = await tokenContract.estimateGas({
//   to: tokenAddress,
//   data: txData.data,  // The data to call `transferFrom`
//   from: wallet.address,  // Address of the wallet executing the transaction
// });
// console.log("Gas Estimate:", gasLimit.toString());

  // Create the transaction object
  const unsignedTx = {
    to: tokenAddress,
    data: txData.data,  // The data to call `transferFrom`
    gasLimit: gasEstimate,
    // gasPrice: gasPrice,  // Custom gas price (10 gwei)
    chainId: 97,  // Mainnet chain ID (change if on a testnet),
    nonce: currentNonce, // Ensure to use the latest nonce
  };

  // Step 2: Sign the transaction
  const signedTx = await wallet.signTransaction(unsignedTx);

  console.log('Signed Transaction:', signedTx);

  // Step 3: Send the signed transaction to the network
  const txResponse = await provider.sendTransaction(signedTx);
  console.log('Transaction Hash:', txResponse.hash);

  // Wait for the transaction to be confirmed
  // const receipt = await txResponse.wait();
  // console.log('Transaction Confirmed:', receipt);
}

signAndSendTransferFrom().catch(console.error);
