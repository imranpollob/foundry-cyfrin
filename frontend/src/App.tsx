import { useState, useEffect, useMemo } from 'react'
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useBalance, useChainId, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi'
import { formatEther, parseEther } from 'ethers'
import { fundMeAbi, contractAddresses, MINIMUM_USD } from './contracts'

function App() {
  const { address, isConnected } = useAccount()
  const { connectors, connect, isPending, error } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const [fundAmount, setFundAmount] = useState('')
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null)
  const [toast, setToast] = useState<null | { type: 'success' | 'error' | 'info', message: string }>(null)

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message })
    window.clearTimeout((showToast as any)._t)
      ; (showToast as any)._t = window.setTimeout(() => setToast(null), 4000)
  }

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

  // We don't have total funders count in ABI; skipping misleading display

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

  const { chains, switchChain, isPending: isSwitching, failureReason: switchError } = useSwitchChain()

  useEffect(() => {
    if (switchError) {
      showToast('error', `Network switch failed: ${switchError.message}`)
    }
  }, [switchError])

  // Refetch data when transactions are successful
  useEffect(() => {
    if (fundReceipt.isSuccess) {
      refetchContractBalance()
      refetchUserFundedAmount()
      refetchUserBalance()
      setFundAmount('') // Clear the input field after successful funding
      showToast('success', 'Funding successful!')
    }
  }, [fundReceipt.isSuccess])

  useEffect(() => {
    if (withdrawReceipt.isSuccess) {
      refetchContractBalance()
      refetchUserFundedAmount()
      refetchUserBalance()
      showToast('success', 'Withdrawal successful!')
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
      showToast('info', 'Confirm the funding transaction in your wallet...')
    } catch (error) {
      console.error('Funding failed:', error)
      showToast('error', `Funding failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleWithdraw = async () => {
    if (!address || !isOwner) return

    try {
      withdrawFunds({
        address: contractAddress,
        abi: fundMeAbi,
        functionName: 'withdraw',
      })
      showToast('info', 'Confirm the withdrawal in your wallet...')
    } catch (error) {
      console.error('Withdrawal failed:', error)
      showToast('error', `Withdrawal failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const formatBalance = (balance: string) => {
    return parseFloat(formatEther(balance)).toFixed(4)
  }

  const formatAddress = (addr?: string) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '')
  const isOwner = useMemo(() => {
    if (!owner || !address) return false
    return (owner as string).toLowerCase() === address.toLowerCase()
  }, [owner, address])

  const currentChain = useMemo(() => chains.find((c) => c.id === chainId), [chains, chainId])
  const explorerBase = currentChain?.blockExplorers?.default?.url

  const getTxUrl = (hash?: `0x${string}`) => (hash && explorerBase && !explorerBase.includes('127.0.0.1') ? `${explorerBase}/tx/${hash}` : undefined)
  const getAddressUrl = (addr?: string) => (addr && explorerBase && !explorerBase.includes('127.0.0.1') ? `${explorerBase}/address/${addr}` : undefined)

  useEffect(() => {
    if (chainId && selectedChainId == null) setSelectedChainId(chainId)
  }, [chainId, selectedChainId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed right-4 top-4 z-50 rounded-xl shadow-lg px-4 py-3 text-sm ${toast.type === 'success' ? 'bg-green-600 text-white' : toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'}`}>
          <div className="flex items-center gap-3">
            <span className="inline-block h-2 w-2 rounded-full bg-white/80"></span>
            <span>{toast.message}</span>
            <button className="ml-3 opacity-80 hover:opacity-100" onClick={() => setToast(null)}>✕</button>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">FundMe</h1>
              <p className="text-gray-600">Decentralized crowdfunding platform</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-3 py-1 border border-gray-200">
                <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                <span className="text-sm text-gray-700">{currentChain?.name || `Chain ${chainId}`}</span>
              </div>
              {isConnected ? (
                <button
                  onClick={() => disconnect()}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Disconnect
                </button>
              ) : (
                <div className="flex flex-col items-end gap-2">
                  {!isMetaMaskAvailable && (
                    <div className="text-yellow-700 text-xs bg-yellow-50 px-2 py-1 rounded">
                      No Web3 wallet detected. <a className="underline" target="_blank" rel="noreferrer" href="https://metamask.io/download/">Install MetaMask</a>
                    </div>
                  )}
                  {connectors.slice(0, 1).map((connector) => (
                    <button
                      key={connector.uid}
                      onClick={() => connect({ connector })}
                      disabled={isPending}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                      {isPending ? 'Connecting…' : 'Connect Wallet'}
                    </button>
                  ))}
                  {error && (
                    <div className="text-red-700 text-xs mt-1 bg-red-50 px-2 py-1 rounded max-w-[280px]">
                      <strong>Connection failed:</strong> {error.message}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Wallet Connection */}
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Wallet</h2>
              {isConnected ? (
                <div className="mt-2 text-sm text-gray-700 flex items-center gap-2">
                  <span className="px-2 py-1 rounded bg-gray-100 font-mono">{formatAddress(address)}</span>
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => address && navigator.clipboard.writeText(address)}
                  >
                    Copy
                  </button>
                  {getAddressUrl(address) && (
                    <a className="text-blue-600 hover:underline" target="_blank" rel="noreferrer" href={getAddressUrl(address)}>
                      View on Explorer ↗
                    </a>
                  )}
                </div>
              ) : (
                <p className="mt-1 text-sm text-gray-600">Connect your wallet to get started.</p>
              )}
            </div>

            {isConnected && (
              <div className="flex items-center gap-3">
                {userBalance && (
                  <div className="text-sm text-gray-700">
                    Balance: <span className="font-semibold">{formatBalance(userBalance.value.toString())} ETH</span>
                  </div>
                )}
                <div className="hidden md:block h-6 w-px bg-gray-200" />
                <div className="flex items-center gap-2">
                  <select
                    value={selectedChainId ?? ''}
                    onChange={(e) => setSelectedChainId(Number(e.target.value))}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    {chains.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => selectedChainId && switchChain({ chainId: selectedChainId })}
                    disabled={isSwitching || selectedChainId === chainId}
                    className="bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white px-3 py-2 rounded-lg text-sm"
                  >
                    {isSwitching ? 'Switching…' : 'Switch'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contract Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold">Minimum USD</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">
              ${minimumUsd ? formatEther(minimumUsd) : MINIMUM_USD}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold">Contract Balance</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {contractBalance ? `${formatBalance(contractBalance.value.toString())} ETH` : '0 ETH'}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold">Your Contribution</h3>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {userFundedAmount ? `${formatBalance(userFundedAmount.toString())} ETH` : '0 ETH'}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold">Owner</h3>
            </div>
            <div className="text-purple-700 text-sm flex items-center gap-2">
              <span className="font-mono">{formatAddress(owner as string)}</span>
              {getAddressUrl(owner as string) && (
                <a className="text-blue-600 hover:underline" target="_blank" rel="noreferrer" href={getAddressUrl(owner as string)}>
                  ↗
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Funding Section */}
        {isConnected && (
          <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Fund the Contract</h2>
            {!isContractDeployed && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded mb-4">
                ⚠️ Contract not deployed on this network. Please deploy the contract first or switch to a supported network.
                <br />
                <strong>Current contract address:</strong> {contractAddress}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
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
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isFunding && <span className="h-4 w-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />}
                {isFunding ? 'Funding…' : 'Fund'}
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {['0.01', '0.05', '0.1', '0.5', '1'].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setFundAmount(amt)}
                  className="px-3 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200"
                >
                  {amt} ETH
                </button>
              ))}
              <button
                onClick={() => userBalance && setFundAmount((Number(formatEther(userBalance.value)) * 0.99).toFixed(4))}
                className="px-3 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200"
              >
                Max
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Minimum funding: ${MINIMUM_USD} USD worth of ETH
            </p>
            {fundTxHash && (
              <p className="text-sm text-gray-600 mt-2">
                Tx: {getTxUrl(fundTxHash) ? (
                  <a className="text-blue-600 hover:underline" target="_blank" rel="noreferrer" href={getTxUrl(fundTxHash)}>
                    {formatAddress(fundTxHash)} ↗
                  </a>
                ) : (
                  <span className="font-mono">{formatAddress(fundTxHash)}</span>
                )}
              </p>
            )}
          </div>
        )}

        {/* Owner Actions */}
        {isConnected && isOwner && (
          <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Owner Actions</h2>
            <button
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              {isWithdrawing && <span className="h-4 w-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />}
              {isWithdrawing ? 'Withdrawing…' : 'Withdraw All Funds'}
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Only contract owner can withdraw funds
            </p>
            {withdrawTxHash && (
              <p className="text-sm text-gray-600 mt-2">
                Tx: {getTxUrl(withdrawTxHash) ? (
                  <a className="text-blue-600 hover:underline" target="_blank" rel="noreferrer" href={getTxUrl(withdrawTxHash)}>
                    {formatAddress(withdrawTxHash)} ↗
                  </a>
                ) : (
                  <span className="font-mono">{formatAddress(withdrawTxHash)}</span>
                )}
              </p>
            )}
          </div>
        )}

        {/* Network Information */}
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Network Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Current Network:</p>
              <p className="text-gray-600">{currentChain?.name || 'Unknown'} (Chain ID: {chainId})</p>
            </div>
            <div>
              <p className="font-semibold">Contract Address:</p>
              <div className="flex items-center gap-2 text-gray-600 font-mono text-sm">
                <span>{contractAddress}</span>
                <button className="text-blue-600 hover:underline" onClick={() => navigator.clipboard.writeText(contractAddress)}>Copy</button>
                {getAddressUrl(contractAddress) && (
                  <a className="text-blue-600 hover:underline" target="_blank" rel="noreferrer" href={getAddressUrl(contractAddress)}>
                    View ↗
                  </a>
                )}
              </div>
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
