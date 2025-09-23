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
    if (type !== 'error') {
      window.clearTimeout((showToast as any)._t)
        ; (showToast as any)._t = window.setTimeout(() => setToast(null), 4000)
    }
  }

  // Check if MetaMask is available
  const isMetaMaskAvailable = typeof window !== 'undefined' && window.ethereum?.isMetaMask

  const contractAddress = contractAddresses[chainId as keyof typeof contractAddresses] || contractAddresses[11155111]

  // Check if contract is deployed on current network (only when wallet is connected)
  const isContractDeployed = isConnected && contractAddress && !contractAddress.includes('YourDeployedContractAddress')

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

  const { data: userFundedAmount, refetch: refetchUserFundedAmount } = useReadContract({
    address: contractAddress,
    abi: fundMeAbi,
    functionName: 's_funderToAmountFunded',
    args: address ? [address] : undefined,
  })

  const { data: totalFunders, refetch: refetchTotalFunders } = useReadContract({
    address: contractAddress,
    abi: fundMeAbi,
    functionName: 'getTotalFunders',
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

  useEffect(() => {
    if (error) {
      const cleanMessage = error.message.replace(/Details: .*/, '').trim()
      showToast('error', `Connection failed: ${cleanMessage}`)
    }
  }, [error])

  // Refetch data when transactions are successful
  useEffect(() => {
    if (fundReceipt.isSuccess) {
      refetchContractBalance()
      refetchUserFundedAmount()
      refetchUserBalance()
      refetchTotalFunders()
      setFundAmount('') // Clear the input field after successful funding
      showToast('success', 'Funding successful!')
    }
  }, [fundReceipt.isSuccess])

  useEffect(() => {
    if (withdrawReceipt.isSuccess) {
      refetchContractBalance()
      refetchUserFundedAmount()
      refetchUserBalance()
      refetchTotalFunders()
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
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-indigo-50 via-white to-blue-50 text-gray-900">

      {/* Toast */}
      {toast && (
        <div className={`fixed right-4 top-4 z-50 rounded-xl shadow-lg px-4 py-3 text-sm animate-in slide-in-from-right-2 fade-in duration-300 ${toast.type === 'success' ? 'bg-green-600 text-white' : toast.type === 'error' ? 'bg-red-600 text-white border-2 border-red-400' : 'bg-gray-800 text-white'}`}>
          <div className="flex items-center gap-3">
            <span className="inline-block h-2 w-2 rounded-full bg-white/80 animate-pulse"></span>
            <span>{toast.message}</span>
            <button className="ml-3 opacity-80 hover:opacity-100 transition-opacity" onClick={() => setToast(null)}>✕</button>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
        <header className="mb-8 animate-in slide-in-from-top-2 duration-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">FundMe</h1>
              <p className="text-sm text-gray-600">Decentralized crowdfunding platform</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-3 py-1 border border-gray-200">
                <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-gray-400'} animate-pulse`}></span>
                <span className="text-sm text-gray-700">{currentChain?.name || `Chain ${chainId}`}</span>
              </div>
              {isConnected ? (
                <button
                  onClick={() => disconnect()}
                  className="text-gray-700 px-4 py-2 rounded-lg transition-colors shadow-sm hover:shadow-md border border-gray-300"
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
                      className="disabled:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors shadow-sm hover:shadow-md border border-gray-300"
                    >
                      {isPending ? 'Connecting…' : 'Connect Wallet'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Wallet Connection */}
        <div className="animate-in slide-in-from-left-2 duration-700 bg-white/80 backdrop-blur rounded-2xl border border-gray-200 shadow-sm p-6 mb-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Wallet</h2>
              {isConnected ? (
                <div className="mt-2 text-sm text-gray-700 flex items-center gap-2">
                  <span className="px-2 py-1 rounded bg-gray-100 font-mono">{formatAddress(address)}</span>
                  <button
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                    onClick={() => address && navigator.clipboard.writeText(address)}
                  >
                    Copy
                  </button>
                  {getAddressUrl(address) && (
                    <a className="text-blue-400 hover:text-blue-300 transition-colors" target="_blank" rel="noreferrer" href={getAddressUrl(address)}>
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
                    className="border border-gray-300 bg-white text-gray-900 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {chains.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => selectedChainId && switchChain({ chainId: selectedChainId })}
                    disabled={isSwitching || selectedChainId === chainId}
                    className="disabled:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm transition-colors shadow-sm hover:shadow-md border border-gray-300"
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
          <div className="animate-in slide-in-from-bottom-2 duration-700 delay-100 bg-white/80 backdrop-blur rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all hover:scale-105">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-green-400">💰</span>
              <h3 className="font-semibold">Minimum USD</h3>
            </div>
            <p className="text-2xl font-bold text-green-400">
              ${minimumUsd ? formatEther(minimumUsd as bigint) : MINIMUM_USD}
            </p>
          </div>

          <div className="animate-in slide-in-from-bottom-2 duration-700 delay-200 bg-white/80 backdrop-blur rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all hover:scale-105">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-blue-400">🏦</span>
              <h3 className="font-semibold">Contract Balance</h3>
            </div>
            <p className="text-2xl font-bold text-blue-400">
              {contractBalance ? `${formatBalance(contractBalance.value.toString())} ETH` : '0 ETH'}
            </p>
          </div>

          <div className="animate-in slide-in-from-bottom-2 duration-700 delay-300 bg-white/80 backdrop-blur rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all hover:scale-105">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-orange-400">👤</span>
              <h3 className="font-semibold">Your Contribution</h3>
            </div>
            <p className="text-2xl font-bold text-orange-400">
              {userFundedAmount ? `${formatBalance(userFundedAmount.toString())} ETH` : '0 ETH'}
            </p>
          </div>

          <div className="animate-in slide-in-from-bottom-2 duration-700 delay-500 bg-white/80 backdrop-blur rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all hover:scale-105">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-purple-400">👥</span>
              <h3 className="font-semibold">Total Funders</h3>
            </div>
            <p className="text-2xl font-bold text-purple-400">
              {totalFunders ? totalFunders.toString() : '0'}
            </p>
          </div>
        </div>

        {/* Funding Section */}
        {isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
            <div className="animate-in slide-in-from-right-2 duration-700 bg-white/80 backdrop-blur rounded-2xl border border-gray-200 shadow-sm p-6 mb-6 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-green-400">🚀</span> Fund the Contract
              </h2>
              {!isContractDeployed && (
                <div className="text-red-400 text-sm bg-red-50 p-3 rounded mb-4">
                  ⚠️ Contract not deployed on this network. Please deploy the contract first or switch to a supported network.
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount in ETH"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  disabled={!isContractDeployed}
                />
                <button
                  onClick={handleFund}
                  disabled={isFunding || !fundAmount || !isContractDeployed}
                  className="text-gray-700 disabled:text-gray-300 px-6 py-2 rounded-lg transition-all shadow-sm hover:shadow-md hover:scale-105 flex items-center justify-center gap-2 border border-gray-300"
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
                    className="px-3 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200 transition-colors hover:scale-105 border border-gray-300"
                  >
                    {amt} ETH
                  </button>
                ))}
                <button
                  onClick={() => userBalance && setFundAmount((Number(formatEther(userBalance.value)) * 0.99).toFixed(4))}
                  className="px-3 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200 transition-colors hover:scale-105 border border-gray-300"
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
                    <a className="text-blue-400 hover:text-blue-300 transition-colors" target="_blank" rel="noreferrer" href={getTxUrl(fundTxHash)}>
                      {formatAddress(fundTxHash)} ↗
                    </a>
                  ) : (
                    <span className="font-mono">{formatAddress(fundTxHash)}</span>
                  )}
                </p>
              )}
            </div>

            <div className="animate-in fade-in duration-700 delay-300 bg-white/80 backdrop-blur rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-blue-400">🌐</span> Network Information
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <p className="font-semibold">Current Network:</p>
                  <p className="text-gray-600">{currentChain?.name || 'Unknown'} (Chain ID: {chainId})</p>
                </div>
                <div>
                  <p className="font-semibold">Contract Address:</p>
                  <div className="flex items-center gap-2 text-gray-600 font-mono text-sm">
                    <span>{formatAddress(contractAddress)}</span>
                    <button className="text-blue-400 hover:text-blue-300 transition-colors" onClick={() => navigator.clipboard.writeText(contractAddress)}>Copy</button>
                    {getAddressUrl(contractAddress) && (
                      <a className="text-blue-400 hover:text-blue-300 transition-colors" target="_blank" rel="noreferrer" href={getAddressUrl(contractAddress)}>
                        View ↗
                      </a>
                    )}
                  </div>
                  {!isContractDeployed && (
                    <p className="text-red-400 text-xs mt-1">
                      Contract not deployed - update contracts.ts with deployed address
                    </p>
                  )}
                </div>
                <div>
                  <p className="font-semibold">Current Owner:</p>
                  <div className="flex items-center gap-2 text-gray-600 font-mono text-sm">
                    <span>{owner ? formatAddress(owner as string) : 'Loading...'}</span>
                    <button className="text-blue-400 hover:text-blue-300 transition-colors" onClick={() => navigator.clipboard.writeText(contractAddress)}>Copy</button>
                    {getAddressUrl(contractAddress) && (
                      <a className="text-blue-400 hover:text-blue-300 transition-colors" target="_blank" rel="noreferrer" href={getAddressUrl(contractAddress)}>
                        View ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
              {!isContractDeployed && (
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <p className="text-blue-400 text-sm">
                    <strong>To deploy the contract:</strong><br />
                    <strong>For local testing:</strong> Start Anvil (`anvil`) in terminal, then run `npm run deploy:local`<br />
                    <strong>For Sepolia testnet:</strong> Set environment variables and run `npm run deploy:sepolia`<br />
                    Then update the contract address in `src/contracts.ts`
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Owner Actions */}
        {isConnected && isOwner && (
          <div className="animate-in slide-in-from-left-2 duration-700 bg-white/80 backdrop-blur rounded-2xl border border-gray-200 shadow-sm p-6 mb-6 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-4 text-red-400 flex items-center gap-2">
              <span className="text-red-400">🔥</span> Owner Actions
            </h2>
            <button
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              className="disabled:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-all shadow-sm hover:shadow-md hover:scale-105 flex items-center gap-2 border border-gray-300"
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
                  <a className="text-blue-400 hover:text-blue-300 transition-colors" target="_blank" rel="noreferrer" href={getTxUrl(withdrawTxHash)}>
                    {formatAddress(withdrawTxHash)} ↗
                  </a>
                ) : (
                  <span className="font-mono">{formatAddress(withdrawTxHash)}</span>
                )}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
