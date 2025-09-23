import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useBalance, useChainId, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther, parseEther } from 'ethers'
import { fundMeAbi, contractAddresses, MINIMUM_USD } from './contracts'

function App() {
  const { address, isConnected } = useAccount()
  const { connectors, connect, isPending, error } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const [fundAmount, setFundAmount] = useState('')

  // Check if MetaMask is available
  const isMetaMaskAvailable = typeof window !== 'undefined' && window.ethereum?.isMetaMask

  const contractAddress = contractAddresses[chainId as keyof typeof contractAddresses] || contractAddresses[11155111]

  // Check if contract is deployed on current network
  const isContractDeployed = contractAddress && !contractAddress.includes('YourDeployedContractAddress')

  // Read contract data
  const { data: minimumUsd } = useReadContract({
    address: contractAddress,
    abi: fundMeAbi,
    functionName: 'MINIMUM_USD',
  })

  const { data: owner } = useReadContract({
    address: contractAddress,
    abi: fundMeAbi,
    functionName: 'getOwner',
  })

  const { data: contractBalance, refetch: refetchContractBalance } = useBalance({
    address: contractAddress,
  })

  const { data: fundersCount } = useReadContract({
    address: contractAddress,
    abi: fundMeAbi,
    functionName: 's_funders',
    args: [0n], // Just to check if array exists
  })

  const { data: userFundedAmount, refetch: refetchUserFundedAmount } = useReadContract({
    address: contractAddress,
    abi: fundMeAbi,
    functionName: 's_funderToAmountFunded',
    args: address ? [address] : undefined,
  })

  // Write contract functions
  const { writeContract: fundContract, data: fundTxHash, isPending: isFunding } = useWriteContract()
  const { writeContract: withdrawFunds, data: withdrawTxHash, isPending: isWithdrawing } = useWriteContract()

  // Get user's balance
  const { data: userBalance, refetch: refetchUserBalance } = useBalance({
    address: address,
  })

  // Wait for transaction receipts and refetch data
  const fundReceipt = useWaitForTransactionReceipt({
    hash: fundTxHash,
  })

  const withdrawReceipt = useWaitForTransactionReceipt({
    hash: withdrawTxHash,
  })

  // Refetch data when transactions are successful
  useEffect(() => {
    if (fundReceipt.isSuccess) {
      refetchContractBalance()
      refetchUserFundedAmount()
      refetchUserBalance()
      setFundAmount('') // Clear the input field after successful funding
    }
  }, [fundReceipt.isSuccess])

  useEffect(() => {
    if (withdrawReceipt.isSuccess) {
      refetchContractBalance()
      refetchUserFundedAmount()
      refetchUserBalance()
    }
  }, [withdrawReceipt.isSuccess])

  const handleFund = async () => {
    if (!fundAmount || !address) {
      console.error('Missing fundAmount or address:', { fundAmount, address })
      return
    }

    if (!isContractDeployed) {
      alert('Contract not deployed on this network. Please deploy the contract first.')
      return
    }

    // Check if user has enough ETH
    const amountInWei = parseEther(fundAmount)
    if (userBalance && amountInWei > userBalance.value) {
      alert(`Insufficient balance. You have ${formatBalance(userBalance.value.toString())} ETH but trying to send ${fundAmount} ETH.`)
      return
    }

    try {
      console.log('Attempting to fund with:', {
        contractAddress,
        amountInWei: amountInWei.toString(),
        fundAmount,
        address,
        chainId
      })

      fundContract({
        address: contractAddress,
        abi: fundMeAbi,
        functionName: 'fund',
        value: amountInWei,
      })
    } catch (error) {
      console.error('Funding failed:', error)
      alert(`Funding failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleWithdraw = async () => {
    if (!address || owner !== address) return

    try {
      withdrawFunds({
        address: contractAddress,
        abi: fundMeAbi,
        functionName: 'withdraw',
      })
    } catch (error) {
      console.error('Withdrawal failed:', error)
    }
  }

  const formatBalance = (balance: string) => {
    return parseFloat(formatEther(balance)).toFixed(4)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">FundMe</h1>
          <p className="text-lg text-gray-600">Decentralized crowdfunding platform</p>
        </header>

        {/* Wallet Connection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold">Wallet Connection</h2>
            </div>
            {isConnected ? (
              <button
                onClick={() => disconnect()}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <div className="flex flex-col space-y-2">
                {!isMetaMaskAvailable && (
                  <div className="text-yellow-600 text-sm bg-yellow-50 p-2 rounded">
                    ⚠️ MetaMask not detected.{' '}
                    <a
                      href="https://metamask.io/download/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-yellow-800"
                    >
                      Install MetaMask
                    </a>{' '}
                    to connect.
                  </div>
                )}
                <div className="flex space-x-2">
                  {connectors.map((connector) => (
                    <button
                      key={connector.uid}
                      onClick={() => connect({ connector })}
                      disabled={isPending || !isMetaMaskAvailable}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      {isPending ? 'Connecting...' : `Connect ${connector.name}`}
                    </button>
                  ))}
                </div>
                {error && (
                  <div className="text-red-600 text-sm mt-2 bg-red-50 p-2 rounded">
                    <strong>Connection failed:</strong> {error.message}
                    {error.message.includes('User rejected') && (
                      <div className="mt-1">Please approve the connection in MetaMask.</div>
                    )}
                    {error.message.includes('network') && (
                      <div className="mt-1">Try switching to Sepolia or Polygon Amoy network in MetaMask.</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {isConnected && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-green-800">
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
              {userBalance && (
                <p className="text-green-700 text-sm mt-1">
                  Balance: {formatBalance(userBalance.value.toString())} ETH
                </p>
              )}
            </div>
          )}
        </div>

        {/* Contract Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold">Minimum USD</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">
              ${minimumUsd ? formatEther(minimumUsd) : MINIMUM_USD}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold">Contract Balance</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {contractBalance ? `${formatBalance(contractBalance.value.toString())} ETH` : '0 ETH'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold">Total Funders</h3>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {fundersCount ? 'Multiple' : '0'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold">Your Contribution</h3>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {userFundedAmount ? `${formatBalance(userFundedAmount.toString())} ETH` : '0 ETH'}
            </p>
          </div>
        </div>

        {/* Funding Section */}
        {isConnected && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Fund the Contract</h2>
            {!isContractDeployed && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded mb-4">
                ⚠️ Contract not deployed on this network. Please deploy the contract first or switch to a supported network.
                <br />
                <strong>Current contract address:</strong> {contractAddress}
              </div>
            )}
            <div className="flex space-x-4">
              <input
                type="number"
                step="0.01"
                placeholder="Amount in ETH"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!isContractDeployed}
              />
              <button
                onClick={handleFund}
                disabled={isFunding || !fundAmount || !isContractDeployed}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {isFunding ? 'Funding...' : 'Fund'}
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Minimum funding: ${MINIMUM_USD} USD worth of ETH
            </p>
          </div>
        )}

        {/* Owner Actions */}
        {isConnected && owner === address && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Owner Actions</h2>
            <button
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
            >
              {isWithdrawing ? 'Withdrawing...' : 'Withdraw All Funds'}
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Only contract owner can withdraw funds
            </p>
          </div>
        )}

        {/* Network Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Network Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Current Network:</p>
              <p className="text-gray-600">Chain ID: {chainId}</p>
            </div>
            <div>
              <p className="font-semibold">Contract Address:</p>
              <p className="text-gray-600 font-mono text-sm">{contractAddress}</p>
              {!isContractDeployed && (
                <p className="text-red-600 text-xs mt-1">
                  Contract not deployed - update contracts.ts with deployed address
                </p>
              )}
            </div>
          </div>
          {!isContractDeployed && (
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="text-blue-800 text-sm">
                <strong>To deploy the contract:</strong><br />
                <strong>For local testing:</strong> Start Anvil (`anvil`) in terminal, then run `npm run deploy:local`<br />
                <strong>For Sepolia testnet:</strong> Set environment variables and run `npm run deploy:sepolia`<br />
                Then update the contract address in `src/contracts.ts`
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
