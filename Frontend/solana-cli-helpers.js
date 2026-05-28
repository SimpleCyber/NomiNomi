const { Connection, LAMPORTS_PER_SOL, clusterApiUrl, PublicKey, Keypair } = require('@solana/web3.js');
const { createMint, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } = require('@solana/spl-token');

// For CLI simulation, we use clusterApiUrl('devnet') as per original request
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

/**
 * JS equivalent of: solana-keygen new
 */
function createNewWallet() {
    const keypair = Keypair.generate();
    console.log('--- New Wallet Created ---');
    console.log('Public Key:', keypair.publicKey.toBase58());
    console.log('Secret Key (use this to recover):', Array.from(keypair.secretKey));
    return keypair;
}

/**
 * JS equivalent of: solana airdrop 1
 */
async function airdrop(publicKey, amountSOL) {
    console.log(`Requesting airdrop of ${amountSOL} SOL for ${publicKey}...`);
    const signature = await connection.requestAirdrop(new PublicKey(publicKey), amountSOL * LAMPORTS_PER_SOL);
    const latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signature,
    });
    console.log('Airdrop confirmed. Signature:', signature);
    return signature;
}

/**
 * JS equivalent of: solana balance
 */
async function getBalance(publicKey) {
    const balance = await connection.getBalance(new PublicKey(publicKey));
    console.log(`Balance for ${publicKey}: ${balance / LAMPORTS_PER_SOL} SOL`);
    return balance;
}

/**
 * Create Token Mint
 */
async function createTokenMint(payer, mintAuthority) {
    console.log('Creating token mint...');
    const mint = await createMint(
        connection,
        payer,
        mintAuthority,
        null,
        6,
        TOKEN_PROGRAM_ID
    );
    console.log('Mint created at:', mint.toBase58());
    return mint;
}

/**
 * Create ATA and Mint some tokens
 */
async function mintNewTokens(payer, mint, to, amount) {
    console.log(`Creating associated token account for ${to}...`);
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        new PublicKey(to)
    );

    console.log('Token account created at:', tokenAccount.address.toBase58());
    
    console.log(`Minting ${amount} tokens...`);
    await mintTo(
        connection,
        payer,
        mint,
        tokenAccount.address,
        payer.publicKey,
        amount
    );
    console.log('Minting complete.');
}

// Example Main function to run the flow
async function main() {
    // 1. Create a wallet
    const payer = createNewWallet();
    
    // 2. Airdrop some SOL (Devnet only)
    await airdrop(payer.publicKey.toBase58(), 1);
    
    // 3. Check Balance
    await getBalance(payer.publicKey.toBase58());
    
    // 4. Create Token Mint
    const mint = await createTokenMint(payer, payer.publicKey);
    
    // 5. Mint tokens
    await mintNewTokens(payer, mint, payer.publicKey.toBase58(), 1000000);
    
    console.log('SUCCESS: Full Solana flow completed on Devnet!');
}

// Uncomment to run
// main().catch(console.error);

module.exports = {
    createNewWallet,
    airdrop,
    getBalance,
    createTokenMint,
    mintNewTokens
};
