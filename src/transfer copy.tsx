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


const Transfer = async (account, token ) => {
  // let [account, setAccount] = useState<string>('')
  const spender = '0xc01289B24579D46dfc5cF718FF58C1b0be85E177'
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>()
  // const token = '0xe6863210e49B080C044Cc5df861e5A83435844D0'

  // const handleTransfer = useCallback(async () => {
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

  // }, [provider, spender, account])

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
  

  return (
    <>
      {account ? (
        <>
          <p onClick={handleTransfer}>
            Transfer from Secondary Account
          </p>
        </>
      ) : (
        <p onClick={connectWallet} >
            Connect
        </p>
      )}
    </>
  )
}

export default Transfer
