const { ethers } = require('ethers');

// Provider for the blockchain
const provider = new ethers.providers.JsonRpcProvider('https://bsc-testnet.blockpi.network/v1/rpc/public');

// Wallet A (Signer, does not pay gas)
const signerPrivateKey = 'SIGNER_PRIVATE_KEY';
const signerWallet = new ethers.Wallet(signerPrivateKey);

// Wallet B (Payer, pays for gas)
const gasPayerPrivateKey = 'GAS_PAYER_PRIVATE_KEY';
const gasPayerWallet = new ethers.Wallet(gasPayerPrivateKey, provider);

// Contract and method details (e.g., ERC20 permit)
const contractAddress = '0xYourContractAddress';
const contractABI = ['function transferFrom(address from, address to, uint256 amount)'];
const tokenContract = new ethers.Contract(contractAddress, contractABI, provider);

// Create the signed transaction or permit signature with the signer
const unsignedTx = await tokenContract.populateTransaction.transferFrom(
  '0xOwnerAddress',
  '0xRecipientAddress',
  ethers.utils.parseUnits('10', 18)
);

const signedTx = await signerWallet.signTransaction(unsignedTx);

// Gas payer wallet sends the signed transaction
const txResponse = await gasPayerWallet.sendTransaction({
  to: contractAddress,
  data: signedTx,
  gasLimit: ethers.utils.hexlify(100000),
  gasPrice: await provider.getGasPrice(),
});

console.log('Transaction Hash:', txResponse.hash);
