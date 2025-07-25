// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Gem, Zap, User, Shield, Clock, ArrowUp, BarChart, ShoppingCart, TrendingUp, Power, ChevronsUp, DollarSign, Lock } from 'lucide-react';
// Import Solana Web3.js and Wallet Adapter hooks
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js'; // Added PublicKey, Transaction, SystemProgram
import { WalletNotConnectedError } from '@solana/wallet-adapter-base'; // Added WalletNotConnectedError

// --- MOCK SOLANA API (REMOVE OR COMMENT OUT THIS ENTIRE SECTION) ---
/*
const useMockSolana = () => {
    const [balance, setBalance] = useState(1000);
    const [staked, setStaked] = useState(0);
    const [loading, setLoading] = useState(false);

    const connectWallet = useCallback(async () => {
        console.log("Connecting to Phantom wallet...");
        // Mock connection
        return { publicKey: "YOUR_MOCK_PUBLIC_KEY" };
    }, []);

    const getBalance = useCallback(async () => {
        setLoading(true);
        await new Promise(res => setTimeout(res, 500));
        setLoading(false);
        return balance;
    }, [balance]);

    const stake = useCallback(async (amount) => {
        if (balance < amount) {
            console.error("Insufficient balance to stake");
            return false;
        }
        setLoading(true);
        await new Promise(res => setTimeout(res, 1000));
        setBalance(prev => prev - amount);
        setStaked(prev => prev + amount);
        setLoading(false);
        console.log(`Staked ${amount} SHUVLER`);
        return true;
    }, [balance]);
    
    const unstake = useCallback(async (amount) => {
        if (staked < amount) {
            console.error("Insufficient staked amount");
            return false;
        }
        setLoading(true);
        await new Promise(res => setTimeout(res, 1000));
        setStaked(prev => prev - amount);
        setBalance(prev => prev + amount);
        setLoading(false);
        console.log(`Unstaked ${amount} SHUVLER`);
        return true;
    }, [staked]);


    return { connectWallet, getBalance, balance, setBalance, staked, setStaked, stake, unstake, loading };
};
*/


// --- GAME DATA (Keep as is) ---
const UPGRADES = {
    equipment: [
        { id: 'e1', name: 'Basic Shovel', level: 1, cost: 50, boost: 1.2 },
        { id: 'e2', name: 'Steel Excavator', level: 2, cost: 250, boost: 1.5 },
        { id: 'e3', name: 'Laser Drill', level: 3, cost: 1000, boost: 2 },
    ],
    boosters: [
        { id: 'b1', name: 'Energy Rush', cost: 100, duration: 60, multiplier: 2 },
        { id: 'b2', name: 'Frenzy Mode', cost: 500, duration: 30, multiplier: 5 },
    ],
    cards: [
        { id: 'c1', name: 'Profit Card S', level: 1, cost: 200, profitBoost: 0.05 },
        { id: 'c2', name: 'Profit Card M', level: 2, cost: 800, profitBoost: 0.1 },
        { id: 'c3', name: 'Profit Card L', level: 3, cost: 2000, profitBoost: 0.2 },
    ],
    autoMiner: {
        id: 'am1',
        name: 'Auto-Miner',
        cost12h: 10,
        cost24h: 20,
        duration12h: 12 * 3600,
        duration24h: 24 * 3600,
    }
};

const CHARACTER_STYLES = [
    { id: 'char1', name: 'Default Miner', color: 'bg-gray-500' },
    { id: 'char4', name: 'Silver Miner', color: 'bg-slate-400' },
    { id: 'char2', name: 'Gold Miner', color: 'bg-yellow-500' },
    { id: 'char5', name: 'Platinum Miner', color: 'bg-slate-300' },
    { id: 'char3', name: 'Diamond Miner', color: 'bg-blue-300' },
];

// --- UI COMPONENTS (Keep as is) ---

const Header = ({ balance, staked }) => (
    <header className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-b-3xl shadow-lg flex justify-between items-center text-white sticky top-0 z-10">
        <div className="flex items-center space-x-2">
            <Gem className="text-yellow-400 w-8 h-8" />
            <div>
                <h1 className="text-xl font-bold">SHUVLER</h1>
                <p className="text-xs text-gray-300">Solana Mining Game</p>
            </div>
        </div>
        <div className="text-right">
            <p className="text-lg font-semibold">{balance.toFixed(4)} <span className="text-yellow-400">SHV</span></p>
            <p className="text-xs text-gray-400">Staked: {staked.toFixed(2)} SHV</p>
        </div>
    </header>
);

const MiningSection = ({ onMine, miningPower, characterStyle }) => {
    const [clicks, setClicks] = useState([]);

    const handleMine = (e) => {
        onMine();
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const newClick = { id: Date.now(), x, y };
        setClicks(prev => [...prev, newClick]);
        setTimeout(() => {
            setClicks(prev => prev.filter(c => c.id !== newClick.id));
        }, 1000);
    };

    return (
        <div className="relative flex flex-col items-center justify-center my-8">
            <div
                className={`w-48 h-48 ${characterStyle.color} rounded-full flex items-center justify-center shadow-2xl cursor-pointer select-none transform transition-transform duration-150 active:scale-95 overflow-hidden`}
                onClick={handleMine}
            >
                <Gem className="w-24 h-24 text-white/80" />
                {clicks.map(click => (
                    <div
                        key={click.id}
                        className="absolute text-yellow-300 font-bold text-2xl animate-ping-up"
                        style={{ left: `${click.x}px`, top: `${click.y}px` }}
                    >
                        +{miningPower.toFixed(2)}
                    </div>
                ))}
            </div>
            <p className="mt-4 text-center text-lg text-white">Mining Power: <span className="font-bold text-yellow-400">{miningPower.toFixed(2)} SHV/tap</span></p>
        </div>
    );
};

const TabButton = ({ activeTab, tabName, onClick, children, icon: Icon }) => (
    <button
        onClick={() => onClick(tabName)}
        className={`flex-1 p-3 flex flex-col items-center justify-center text-sm font-medium transition-colors duration-300 ${activeTab === tabName ? 'text-yellow-400 border-t-2 border-yellow-400' : 'text-gray-400 hover:text-white'}`}
    >
        <Icon className="w-6 h-6 mb-1" />
        {children}
    </button>
);

const UpgradeItem = ({ item, onBuy, balance, type, isLocked = false }) => (
    <div className="bg-gray-800/50 p-4 rounded-xl flex items-center justify-between shadow-md">
        <div>
            <h3 className="font-bold text-white">{item.name}</h3>
            <p className="text-sm text-gray-300">
                {type === 'equipment' && `+${((item.boost - 1) * 100).toFixed(0)}% Power`}
                {type === 'booster' && `x${item.multiplier} for ${item.duration}s`}
                {type === 'card' && `+${(item.profitBoost * 100).toFixed(0)}% Profit`}
                {type === 'autoMiner' && `Mines for ${item.duration / 3600} hours`}
            </p>
            <p className="text-xs text-yellow-500">Cost: {item.cost} {type === 'autoMiner' ? 'USD' : 'SHV'}</p>
        </div>
        {isLocked ? (
            <div className="flex items-center justify-center bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">
                <Lock className="w-5 h-5" />
            </div>
        ) : (
            <button
                onClick={() => onBuy(item)}
                disabled={type !== 'autoMiner' && balance < item.cost}
                className="bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg transition-transform duration-150 transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                {type === 'autoMiner' ? 'Buy' : 'Upgrade'}
            </button>
        )}
    </div>
);

const StakingSection = ({ staked, balance, onStake, onUnstake, loading }) => {
    const [amount, setAmount] = useState('');

    const handleStake = () => {
        const stakeAmount = parseFloat(amount);
        if (!isNaN(stakeAmount) && stakeAmount > 0) {
            onStake(stakeAmount);
            setAmount('');
        }
    };

    const handleUnstake = () => {
        const unstakeAmount = parseFloat(amount);
        if (!isNaN(unstakeAmount) && unstakeAmount > 0) {
            onUnstake(unstakeAmount);
            setAmount('');
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-gray-800/50 p-6 rounded-xl text-center">
                <h3 className="text-lg font-semibold text-gray-300">Total Staked</h3>
                <p className="text-4xl font-bold text-yellow-400 my-2">{staked.toFixed(4)} SHV</p>
                <p className="text-sm text-green-400">Estimated APY: 12.5%</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-xl">
                <h4 className="font-bold text-white mb-2">Manage Stake</h4>
                <div className="relative">
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={`Amount (Balance: ${balance.toFixed(2)})`}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 pr-16 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    <button
                        onClick={() => setAmount(balance.toString())}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-yellow-600 text-black text-xs font-bold py-1 px-3 rounded-md hover:bg-yellow-500 transition-colors"
                    >
                        MAX
                    </button>
                </div>
                <div className="flex space-x-2 mt-3">
                    <button
                        onClick={handleStake}
                        disabled={loading || !amount || parseFloat(amount) > balance}
                        className="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg transition-colors hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Staking...' : 'Stake'}
                    </button>
                    <button
                        onClick={handleUnstake}
                        disabled={loading || !amount || parseFloat(amount) > staked}
                        className="flex-1 bg-red-600 text-white font-bold py-3 rounded-lg transition-colors hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Unstaking...' : 'Unstake'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
export default function App() {
    // --- Replaced useMockSolana with useConnection and useWallet ---
    const { connection } = useConnection(); //
    const { publicKey, sendTransaction, connected } = useWallet(); //

    // States are now managed directly
    const [balance, setBalance] = useState(0); // Initialize with 0 for real balance
    const [staked, setStaked] = useState(0); // Staked amount will still be local without a smart contract
    const [loading, setLoading] = useState(false); //
    const [error, setError] = useState(null); // To display potential errors


    const [activeTab, setActiveTab] = useState('mine');
    const [miningPower, setMiningPower] = useState(0.01);
    const [characterStyle, setCharacterStyle] = useState(CHARACTER_STYLES[0]);
    const [activeBoost, setActiveBoost] = useState(null);
    const [autoMinerTime, setAutoMinerTime] = useState(0);
    const [cardLockoutEnd, setCardLockoutEnd] = useState(null);
    const [purchasedCard, setPurchasedCard] = useState(null);
    const [selectedAutoMinerDuration, setSelectedAutoMinerDuration] = useState(12);

    // --- EFFECT TO FETCH REAL BALANCE ---
    useEffect(() => {
        const fetchBalance = async () => {
            if (!connection || !publicKey) {
                setBalance(0); // Reset balance if not connected
                return;
            }
            try {
                setLoading(true);
                setError(null);
                const walletBalance = await connection.getBalance(publicKey); // Get balance in lamports
                setBalance(walletBalance / LAMPORTS_PER_SOL); // Convert lamports to SOL
            } catch (err) {
                console.error("Error fetching balance:", err);
                setError("Failed to fetch balance. " + err.message);
                setBalance(0);
            } finally {
                setLoading(false);
            }
        };

        fetchBalance();
        // Optionally, set up an interval to periodically refresh the balance
        const intervalId = setInterval(fetchBalance, 15000); // Refresh every 15 seconds

        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, [connection, publicKey]); // Re-run when connection or public key changes

    // Game loop for passive income (staking and auto-miner)
    useEffect(() => {
        const gameTick = setInterval(() => {
            // Staking rewards (still local simulation unless integrated with smart contract)
            if (staked > 0) {
                const stakingReward = (staked * 0.125) / (365 * 24 * 60 * 60); // 12.5% APY per second
                setBalance(prev => prev + stakingReward);
            }
            // Auto-miner
            if (autoMinerTime > 0) {
                const autoMineAmount = (miningPower * 0.5) / 60; // 0.5 taps per minute
                setBalance(prev => prev + autoMineAmount);
                setAutoMinerTime(prev => prev - 1);
            }
        }, 1000);

        return () => clearInterval(gameTick);
    }, [staked, autoMinerTime, miningPower, setBalance]);

    // Booster countdown
    useEffect(() => {
        if (activeBoost) {
            const timer = setTimeout(() => {
                setActiveBoost(null);
                 // Reset mining power to base after boost
                const basePower = UPGRADES.equipment.reduce((acc, upg) => acc * (upg.level > 1 ? upg.boost : 1), 0.01);
                setMiningPower(basePower);
            }, activeBoost.duration * 1000);
            return () => clearTimeout(timer);
        }
    }, [activeBoost]);

    // Card lockout countdown
    useEffect(() => {
        if (cardLockoutEnd) {
            const interval = setInterval(() => {
                if (Date.now() >= cardLockoutEnd) {
                    setCardLockoutEnd(null);
                    setPurchasedCard(null);
                    clearInterval(interval);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [cardLockoutEnd]);


    const handleMine = () => {
        // Mining is still a local calculation for now
        const currentPower = activeBoost ? miningPower * activeBoost.multiplier : miningPower;
        setBalance(prev => prev + currentPower);
    };

    const handleBuyUpgrade = (item, type) => {
        // These upgrades still affect local state. For on-chain persistence,
        // you would interact with a smart contract here.
        if (type === 'equipment') {
            if (balance >= item.cost) {
                setBalance(prev => prev - item.cost);
                setMiningPower(prev => prev * item.boost);
            }
        }
        if (type === 'booster') {
             if (balance >= item.cost && !activeBoost) {
                setBalance(prev => prev - item.cost);
                setActiveBoost(item);
                setMiningPower(prev => prev * item.multiplier);
            }
        }
        if (type === 'card') {
            if (balance >= item.cost && !cardLockoutEnd) {
                setBalance(prev => prev - item.cost);
                setPurchasedCard(item.id);
                // Lockout if it's the highest card
                if (item.id === 'c3') {
                    setCardLockoutEnd(Date.now() + 12 * 3600 * 1000);
                }
            }
        }
        if (type === 'autoMiner') {
            console.log(`Buying ${item.name} for $${item.cost}`);
            // Auto-miner purchase is also local logic for now
            setAutoMinerTime(prev => prev + item.duration);
        }
    };

    // --- REAL STAKE FUNCTION ---
    const stake = useCallback(async (amount) => {
        if (!publicKey || !sendTransaction) { // Check if wallet is connected
            alert('Wallet not connected! Please connect your wallet to stake.');
            return;
        }
        if (balance < amount) { // Local balance check
            alert('Insufficient balance to stake.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // --- THIS IS A PLACEHOLDER TRANSACTION ---
            // In a real dApp, you would build an instruction to interact with your staking smart contract.
            // This example simply transfers SOL from the user to a dummy address.
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    // Replace with the actual public key of your staking program's vault or main account
                    toPubkey: new PublicKey("G42D8uX8vVvTqR9H3o2jP7L9z2Y0E6Q7B0C5A8F9D2E1"), // DUMMY PUBLIC KEY
                    lamports: amount * LAMPORTS_PER_SOL, // Convert SOL to lamports
                })
            );

            // Sign and send the transaction
            const signature = await sendTransaction(transaction, connection); //
            console.log('Transaction sent with signature:', signature);
            await connection.confirmTransaction(signature, 'processed'); // Wait for confirmation
            console.log('Transaction confirmed!');
            alert(`Successfully initiated stake for ${amount} SHUVLER! (Transaction: ${signature})`);

            // Update local state (you would fetch the real staked amount from your smart contract)
            setBalance(prev => prev - amount);
            setStaked(prev => prev + amount); // This is still local
        } catch (err) {
            console.error("Stake failed:", err);
            if (err instanceof WalletNotConnectedError) {
                setError("Wallet not connected. Please connect your wallet.");
            } else {
                setError(`Stake transaction failed: ${err.message}`);
            }
            alert(`Stake failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [publicKey, sendTransaction, connection, balance]); // Dependencies for useCallback

    // --- REAL UNSTAKE FUNCTION ---
    const unstake = useCallback(async (amount) => {
        if (!publicKey || !sendTransaction) { // Check if wallet is connected
            alert('Wallet not connected! Please connect your wallet to unstake.');
            return;
        }
        if (staked < amount) { // Local staked amount check
            alert('Insufficient staked amount to unstake.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // --- THIS IS A PLACEHOLDER TRANSACTION ---
            // In a real dApp, you would build an instruction to interact with your unstaking smart contract.
            // This example simply simulates receiving SOL back from a dummy address.
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    // In a real scenario, this would be from your staking program/vault
                    fromPubkey: new PublicKey("G42D8uX8vVvTqR9H3o2jP7L9z2Y0E6Q7B0C5A8F9D2E1"), // DUMMY PUBLIC KEY (replace with your program's address)
                    toPubkey: publicKey,
                    lamports: amount * LAMPORTS_PER_SOL, // Convert SOL to lamports
                })
            );

            // Sign and send the transaction
            const signature = await sendTransaction(transaction, connection); //
            console.log('Transaction sent with signature:', signature);
            await connection.confirmTransaction(signature, 'processed'); // Wait for confirmation
            console.log('Transaction confirmed!');
            alert(`Successfully initiated unstake for ${amount} SHUVLER! (Transaction: ${signature})`);

            // Update local state (you would fetch the real staked amount from your smart contract)
            setStaked(prev => prev - amount);
            setBalance(prev => prev + amount); // This is still local
        } catch (err) {
            console.error("Unstake failed:", err);
            setError(`Unstake transaction failed: ${err.message}`);
            alert(`Unstake failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [publicKey, sendTransaction, connection, staked]); // Dependencies for useCallback


    const renderContent = () => {
        switch (activeTab) {
            case 'mine':
                return <MiningSection onMine={handleMine} miningPower={miningPower} characterStyle={characterStyle} />;
            case 'upgrades':
                return (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white">Equipment</h2>
                        {UPGRADES.equipment.map(item => <UpgradeItem key={item.id} item={item} onBuy={(it) => handleBuyUpgrade(it, 'equipment')} balance={balance} type="equipment" />)}
                        <h2 className="text-xl font-bold text-white mt-6">Boosters</h2>
                        {UPGRADES.boosters.map(item => <UpgradeItem key={item.id} item={item} onBuy={(it) => handleBuyUpgrade(it, 'booster')} balance={balance} type="booster" />)}
                    </div>
                );
            case 'shop':
                const autoMiner = UPGRADES.autoMiner;
                const selectedMiner = {
                    id: autoMiner.id,
                    name: `${selectedAutoMinerDuration}-Hour ${autoMiner.name}`,
                    cost: selectedAutoMinerDuration === 12 ? autoMiner.cost12h : autoMiner.cost24h,
                    duration: selectedAutoMinerDuration === 12 ? autoMiner.duration12h : autoMiner.duration24h,
                };

                 return (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white">Auto-Miners</h2>
                        <div className="bg-gray-800/50 p-2 rounded-xl flex items-center justify-center shadow-md">
                            <div className="flex rounded-lg bg-gray-900">
                                <button onClick={() => setSelectedAutoMinerDuration(12)} className={`px-4 py-2 text-sm font-bold rounded-l-lg ${selectedAutoMinerDuration === 12 ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white'}`}>12 Hours</button>
                                <button onClick={() => setSelectedAutoMinerDuration(24)} className={`px-4 py-2 text-sm font-bold rounded-r-lg ${selectedAutoMinerDuration === 24 ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white'}`}>24 Hours</button>
                            </div>
                        </div>
                        <UpgradeItem item={selectedMiner} onBuy={(it) => handleBuyUpgrade(it, 'autoMiner')} balance={balance} type="autoMiner"/>

                        <h2 className="text-xl font-bold text-white mt-6">Profit Cards</h2>
                        {cardLockoutEnd && (
                            <div className="text-center text-orange-400 bg-orange-500/10 p-2 rounded-lg">
                                Cards locked for: {new Date(cardLockoutEnd - Date.now()).toISOString().substr(11, 8)}
                            </div>
                        )}
                        {UPGRADES.cards.map(item => (
                            <UpgradeItem
                                key={item.id}
                                item={item}
                                onBuy={(it) => handleBuyUpgrade(it, 'card')}
                                balance={balance}
                                type="card"
                                isLocked={!!cardLockoutEnd || (purchasedCard && purchasedCard !== item.id)}
                            />
                        ))}
                    </div>
                );
            case 'staking':
                // Pass the real stake/unstake functions
                return <StakingSection staked={staked} balance={balance} onStake={stake} onUnstake={unstake} loading={loading} />;
            case 'profile':
                return (
                     <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white">Character Style</h2>
                        <div className="grid grid-cols-2 gap-4">
                        {CHARACTER_STYLES.map(style => (
                            <div key={style.id} onClick={() => setCharacterStyle(style)} className={`p-4 rounded-xl text-center cursor-pointer border-2 ${characterStyle.id === style.id ? 'border-yellow-400' : 'border-transparent'} bg-gray-800/50`}>
                                <div className={`w-16 h-16 ${style.color} rounded-full mx-auto mb-2`}></div>
                                <p className="font-semibold text-white">{style.name}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans" style={{
            background: 'radial-gradient(circle, rgba(20,20,40,1) 0%, rgba(10,10,20,1) 100%)'
        }}>
            <style>{`
                .animate-ping-up {
                    animation: ping-up 1s cubic-bezier(0, 0, 0.2, 1) forwards;
                }
                @keyframes ping-up {
                    0% {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-80px) scale(1.5);
                        opacity: 0;
                    }
                }
            `}</style>
            <div className="container mx-auto max-w-md pb-24">
                <Header balance={balance} staked={staked} />
                {connected ? ( // Display content only if wallet is connected
                    <main className="p-4">
                        {loading && <div className="text-center text-blue-400 mb-4">Loading data...</div>}
                        {error && <div className="text-center text-red-400 bg-red-500/10 p-2 rounded-lg mb-4">{error}</div>}
                        {activeBoost && (
                            <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-300 p-3 rounded-xl text-center mb-4 animate-pulse">
                                <p className="font-bold">{activeBoost.name} Active! (x{activeBoost.multiplier} Power)</p>
                            </div>
                        )}
                        {autoMinerTime > 0 && (
                             <div className="bg-blue-500/20 border border-blue-500 text-blue-300 p-3 rounded-xl text-center mb-4">
                                <p className="font-bold">Auto-Miner Active: {new Date(autoMinerTime * 1000).toISOString().substr(11, 8)}</p>
                            </div>
                        )}
                        {renderContent()}
                    </main>
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
                        <p className="text-xl text-gray-300 mb-4">Connect your wallet to start playing!</p>
                        <WalletMultiButton /> {/* This button is provided by WalletModalProvider */}
                    </div>
                )}
            </div>
            <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-lg border-t border-gray-700/50 max-w-md mx-auto rounded-t-2xl">
                <div className="flex justify-around">
                    <TabButton activeTab={activeTab} tabName="mine" onClick={setActiveTab} icon={Gem}>Mine</TabButton>
                    <TabButton activeTab={activeTab} tabName="upgrades" onClick={setActiveTab} icon={ChevronsUp}>Upgrades</TabButton>
                    <TabButton activeTab={activeTab} tabName="shop" onClick={setActiveTab} icon={ShoppingCart}>Shop</TabButton>
                    <TabButton activeTab={activeTab} tabName="staking" onClick={setActiveTab} icon={TrendingUp}>Staking</TabButton>
                    <TabButton activeTab={activeTab} tabName="profile" onClick={setActiveTab} icon={User}>Profile</TabButton>
                </div>
            </nav>
        </div>
    );
}