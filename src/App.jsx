import { useState } from 'react'
import './App.css'
import { TokenLaunchPad } from './components/TokenLaunchPad';
import '@solana/wallet-adapter-react-ui/styles.css';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';

function App() {
	const url = import.meta.env.VITE_RPC_URL;
  return (
    // <div>
        <ConnectionProvider endpoint={url}>
					<WalletProvider wallets={[]} autoConnect>
						<WalletModalProvider>
										
						 <div style={{
								width: "90vw",
								display: "flex",
								justifyContent: "flex-end",
								paddingTop: "8px",
							}}>
								<WalletMultiButton />
							</div>
							<TokenLaunchPad />
						</WalletModalProvider>
					</WalletProvider>
				</ConnectionProvider>
      // </div>

    // </div>
  )
}

export default App
