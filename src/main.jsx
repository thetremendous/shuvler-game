// src/main.jsx
import React, { useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

const Main = () => {
    const network = 'mainnet-beta'; // Already set to mainnet-beta from previous modification
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

    return (
        // Corrected nesting: React.StrictMode should wrap the entire component tree.
        <React.StrictMode>
            <ConnectionProvider endpoint={endpoint}>
                <WalletProvider wallets={wallets} autoConnect>
                    <WalletModalProvider>
                        <App />
                    </WalletModalProvider>
                </WalletProvider>
            </ConnectionProvider>
        </React.StrictMode>
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(<Main />);