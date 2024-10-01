import { createAssociatedTokenAccountInstruction, createInitializeMetadataPointerInstruction, createInitializeMint2Instruction, createInitializeMintInstruction, createMintToInstruction, ExtensionType, getAssociatedTokenAddressSync, getMinimumBalanceForRentExemptMint, getMintLen, LENGTH_SIZE, MINT_SIZE, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID, TYPE_SIZE } from "@solana/spl-token"
import { createInitializeInstruction, createUpdateFieldInstruction, pack } from "@solana/spl-token-metadata";
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";


export function TokenLaunchPad() {

    const { connection } = useConnection();
    const wallet = useWallet();

    if(!wallet.publicKey) {
      console.log("Wallet is not connected");
      return;  
    //throw new Error("Wallet not connected");
    }

    async function createToken() {
        const name = document.getElementById("name").value;
        const symbol = document.getElementById("symbol").value;
        const uri = document.getElementById("uri").value;
        
        const keypair = Keypair.generate();
        const metadata = {
            mint: keypair.publicKey,
            name: name,
            symbol: symbol,
            uri: uri,
            // TODO: add field to ask additionalMetadata
            additionalMetadata: [["description", "Token to learn"]],
        };

        const metadataExtensionLen = TYPE_SIZE + LENGTH_SIZE;
        const metadataLen = pack(metadata).length;
        const mintLen = getMintLen([ExtensionType.MetadataPointer]);
        const lamports = await connection.getMinimumBalanceForRentExemption(metadataExtensionLen + metadataLen + mintLen);

        const createAccountInstruction = SystemProgram.createAccount({
                fromPubkey: wallet.publicKey,
                newAccountPubkey: keypair.publicKey,
                lamports,
                space: mintLen,
                programId: TOKEN_2022_PROGRAM_ID 
            });
        
        const initializeMetadataPointerInstruction = createInitializeMetadataPointerInstruction(
            keypair.publicKey,
            wallet.publicKey,
            keypair.publicKey,
            TOKEN_2022_PROGRAM_ID
        );

        const initializeMintInstruction = createInitializeMintInstruction(
            keypair.publicKey,
            9,
            wallet.publicKey,
            null,
            TOKEN_2022_PROGRAM_ID
        );

        const initializeMetadataInstruction = createInitializeInstruction({
            programId: TOKEN_2022_PROGRAM_ID,
            metadata: keypair.publicKey,
            updateAuthority: wallet.publicKey,
            mint: keypair.publicKey,
            mintAuthority: wallet.publicKey,
            name: metadata.name,
            symbol: metadata.symbol,
            uri: metadata.uri
        });

        const updateFieldInstruction = createUpdateFieldInstruction({
            programId: TOKEN_2022_PROGRAM_ID, 
            metadata: keypair.publicKey, 
            updateAuthority: wallet.publicKey, 
            field: metadata.additionalMetadata[0][0], 
            value: metadata.additionalMetadata[0][1],
        })

        const transaction = new Transaction().add(
            createAccountInstruction,
            initializeMetadataPointerInstruction,
            initializeMintInstruction,
            initializeMetadataInstruction,
            updateFieldInstruction
        );

        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        transaction.partialSign(keypair);

        await wallet.sendTransaction(transaction, connection);
        console.log(keypair.publicKey.toBase58());

        const associatedToken = getAssociatedTokenAddressSync(
            keypair.publicKey,
            wallet.publicKey,
            false,
            TOKEN_2022_PROGRAM_ID
        );

        console.log("associated address: "+ associatedToken);

        const associatedTransaction = new Transaction().add(
            createAssociatedTokenAccountInstruction(
                wallet.publicKey,
                associatedToken,
                wallet.publicKey,
                keypair.publicKey,
                TOKEN_2022_PROGRAM_ID
            )
        );
        await wallet.sendTransaction(associatedTransaction, connection);
        console.log("associated transaction");
      
        const transaction3 = new Transaction().add(
            createMintToInstruction(
                keypair.publicKey,
                associatedToken,
                wallet.publicKey,
                1000000000,
                [],
                TOKEN_2022_PROGRAM_ID
            )
        );

        await wallet.sendTransaction(transaction3, connection);
        console.log("final transaction");
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
        <input className="inputText" id="uri" type="text" placeholder="Metadata link"/><br/>
        <input className="inputText" id="initialSupply" type="text" placeholder="Initial supply"/><br/>
        <button className="btn" onClick={createToken}>Create a token</button>       
    </div>
}
