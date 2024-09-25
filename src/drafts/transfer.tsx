import { signTypedData } from '@uniswap/conedison/provider/index'
import type { PermitSingle } from '@uniswap/Permit2-sdk'
import {
  AllowanceProvider,
  PERMIT2_ADDRESS,
  MaxAllowanceTransferAmount,
  AllowanceTransfer,
} from '@uniswap/Permit2-sdk'
import { ethers, Contract, BigNumber } from 'ethers'
import { useState, useCallback } from 'react'

/**
 * Converts an expiration (in milliseconds) to a deadline (in seconds) suitable for the EVM.
 * Permit2 expresses expirations as deadlines, but JavaScript usually uses milliseconds,
 * so this is provided as a convenience function.
 */
function toDeadline(expiration: number): number {
  return Math.floor((Date.now() + expiration) / 1000)
}


const Permit = () => {
  let [account, setAccount] = useState<string>('')
  const spender = '0xc01289B24579D46dfc5cF718FF58C1b0be85E177'
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>()
  const [approvalAmounts, setApprovalAmmounts] = useState<{
    permitAmount: BigNumber
    expiration: number
    nonce: number
  }>({ permitAmount: BigNumber.from(0), expiration: 0, nonce: 0 })
  const token = '0xe6863210e49B080C044Cc5df861e5A83435844D0'
  const [walletTokens, setWalletTokens] = useState([])


  const handleApprove = useCallback(async () => {
    try {
      const signer = provider!.getSigner(account)
      const permit2ContractAbi = [
        'function approve(address spender,uint amount)',
      ]
      const permit2Contract = new Contract(token, permit2ContractAbi, signer)
      const tx = await permit2Contract.approve(
        PERMIT2_ADDRESS,
        MaxAllowanceTransferAmount
      )
      await tx.wait()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }, [account, provider])

  const handleTransfer = useCallback(async () => {
    console.log(account)
    account = '0xaA64D471b4d3A8Ee8fcacbC4c480d304aCEF0852'
    console.log(account)
    const signer = provider!.getSigner(spender)
    const permit2ContractAbi = [
      'function transferFrom(address from, address to, uint160 amount, address token)',
    ]
    const permit2Contract = new Contract(token, permit2ContractAbi, signer)
    const tx = await permit2Contract.transferFrom(
      account,
      spender,
      BigNumber.from('1000000000000000000'),
      token
    )
    console.log(tx)
    await tx.wait()
  }, [provider, spender, account])

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
      // setSpender(address[1])
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }, [])
  
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

  return (
    <>
      {account ? (
        <>
          <p onClick={handleApprovalCheck} >
            Check Approval Limits
          </p>
          {/* <p onClick={handleApprove} >
            Authorize Permit2
          </p> */}
          <p onClick={handlePermit}>Permit</p>
          <p onClick={handleTransfer}>
            Transfer from Secondary Account
          </p>
          Account: {account}
          
            Permitted Amounts: {approvalAmounts.permitAmount.toString()}
          
          Permitted Expiration: {approvalAmounts.expiration}
          Permitted Nonce: {approvalAmounts.nonce}
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
