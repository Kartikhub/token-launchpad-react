import { createInitializeMint2Instruction, getMinimumBalanceForRentExemptMint, MINT_SIZE, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";


export function TokenLaunchPad() {

    const { connection } = useConnection();
    const wallet = useWallet();

    if(! wallet.publicKey) {
        throw new Error("Wallet not connected");
    }

    async function createToken() {
        // const name = document.getElementById("name").value;
        // const symbol = document.getElementById("symbol").value;
        // const image = document.getElementById("image").value;
        // const initialSupply = document.getElementById("initialSupply").value;
        const keypair = Keypair.generate();
        const lamports = await getMinimumBalanceForRentExemptMint(connection);
        const transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: wallet.publicKey,
                newAccountPubkey: keypair.publicKey,
                lamports,
                space: MINT_SIZE,
                TOKEN_PROGRAM_ID,
            }),
            createInitializeMint2Instruction(keypair.publicKey, 6, wallet.publicKey, null, TOKEN_PROGRAM_ID)
        );
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        transaction.partialSign(keypair);

        await wallet.sendTransaction(transaction, connection);
        console.log(keypair.publicKey);
    }

    return <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
    }}>
        <input className="inputText" id="name" type="text" placeholder="Name"/><br />
        <input className="inputText" id="symbol" type="text" placeholder="Symbol"/><br />
        <input className="inputText" id="image" type="text" placeholder="Image url"/><br/>
        <input className="inputText" id="initialSupply" type="text" placeholder="Initial supply"/><br/>
        <button className="btn" onClick={createToken}>Create a token</button>       
    </div>
}