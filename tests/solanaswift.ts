import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Solanaswift } from "../target/types/solanaswift";
import { 
  PublicKey, 
  Keypair, 
  SystemProgram, 
  SYSVAR_RENT_PUBKEY,
  Transaction
} from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
  getAccount,
  getAssociatedTokenAddress
} from "@solana/spl-token";
import { assert } from "chai";

describe("solanaswift", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Solanaswift as Program<Solanaswift>;
  
  // Test accounts
  let authority: Keypair;
  let user: Keypair;
  let tokenAMint: PublicKey;
  let tokenBMint: PublicKey;
  let poolPDA: PublicKey;
  let poolBump: number;
  let lpMintPDA: PublicKey;
  let lpMintBump: number;
  
  // Token accounts
  let authorityTokenA: PublicKey;
  let authorityTokenB: PublicKey;
  let userTokenA: PublicKey;
  let userTokenB: PublicKey;
  let userLpToken: PublicKey;
  let poolTokenA: PublicKey;
  let poolTokenB: PublicKey;

  const INITIAL_MINT_AMOUNT = new anchor.BN(1_000_000_000_000); // 1M tokens with 6 decimals
  const LIQUIDITY_AMOUNT_A = new anchor.BN(100_000_000_000); // 100K tokens
  const LIQUIDITY_AMOUNT_B = new anchor.BN(100_000_000_000); // 100K tokens

  before(async () => {
    // Generate keypairs
    authority = provider.wallet.publicKey ? provider.wallet : Keypair.generate();
    user = Keypair.generate();

    // Airdrop SOL to user
    const userAirdrop = await provider.connection.requestAirdrop(
      user.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(userAirdrop);

    // Create token mints
    tokenAMint = await createMint(
      provider.connection,
      authority,
      authority.publicKey,
      null,
      9 // 9 decimals
    );

    tokenBMint = await createMint(
      provider.connection,
      authority,
      authority.publicKey,
      null,
      9 // 9 decimals
    );

    // Calculate PDAs
    [poolPDA, poolBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool"), tokenAMint.toBuffer(), tokenBMint.toBuffer()],
      program.programId
    );

    [lpMintPDA, lpMintBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("lp_mint"), poolPDA.toBuffer()],
      program.programId
    );

    // Get associated token addresses
    authorityTokenA = await getAssociatedTokenAddress(tokenAMint, authority.publicKey);
    authorityTokenB = await getAssociatedTokenAddress(tokenBMint, authority.publicKey);
    userTokenA = await getAssociatedTokenAddress(tokenAMint, user.publicKey);
    userTokenB = await getAssociatedTokenAddress(tokenBMint, user.publicKey);
    userLpToken = await getAssociatedTokenAddress(lpMintPDA, user.publicKey);
    poolTokenA = await getAssociatedTokenAddress(tokenAMint, poolPDA, true);
    poolTokenB = await getAssociatedTokenAddress(tokenBMint, poolPDA, true);

    // Create token accounts and mint tokens
    await createAccount(provider.connection, authority, tokenAMint, authority.publicKey);
    await createAccount(provider.connection, authority, tokenBMint, authority.publicKey);
    
    await mintTo(
      provider.connection,
      authority,
      tokenAMint,
      authorityTokenA,
      authority,
      INITIAL_MINT_AMOUNT.toNumber()
    );
    
    await mintTo(
      provider.connection,
      authority,
      tokenBMint,
      authorityTokenB,
      authority,
      INITIAL_MINT_AMOUNT.toNumber()
    );

    // Create user token accounts and transfer some tokens
    await createAccount(provider.connection, user, tokenAMint, user.publicKey);
    await createAccount(provider.connection, user, tokenBMint, user.publicKey);

    // Transfer tokens to user for testing
    await mintTo(
      provider.connection,
      authority,
      tokenAMint,
      userTokenA,
      authority,
      LIQUIDITY_AMOUNT_A.mul(new anchor.BN(2)).toNumber()
    );
    
    await mintTo(
      provider.connection,
      authority,
      tokenBMint,
      userTokenB,
      authority,
      LIQUIDITY_AMOUNT_B.mul(new anchor.BN(2)).toNumber()
    );

    console.log("Setup completed:");
    console.log("Token A Mint:", tokenAMint.toString());
    console.log("Token B Mint:", tokenBMint.toString());
    console.log("Pool PDA:", poolPDA.toString());
    console.log("LP Mint PDA:", lpMintPDA.toString());
  });

  describe("Pool Initialization", () => {
    it("Initializes a new pool", async () => {
      const feeTier = 30; // 0.3%

      await program.methods
        .initializePool(feeTier)
        .accounts({
          pool: poolPDA,
          authority: authority.publicKey,
          tokenAMint: tokenAMint,
          tokenBMint: tokenBMint,
          tokenAVault: poolTokenA,
          tokenBVault: poolTokenB,
          lpMint: lpMintPDA,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([authority])
        .rpc();

      // Verify pool state
      const poolAccount = await program.account.liquidityPool.fetch(poolPDA);
      
      assert.equal(poolAccount.authority.toString(), authority.publicKey.toString());
      assert.equal(poolAccount.tokenAMint.toString(), tokenAMint.toString());
      assert.equal(poolAccount.tokenBMint.toString(), tokenBMint.toString());
      assert.equal(poolAccount.baseFeeBps, feeTier);
      assert.equal(poolAccount.isInitialized, true);
      assert.equal(poolAccount.reserveA.toNumber(), 0);
      assert.equal(poolAccount.reserveB.toNumber(), 0);
      
      console.log("✅ Pool initialized successfully");
    });

    it("Fails to initialize pool with invalid fee tier", async () => {
      const invalidFeeTier = 150; // 1.5% (too high)

      try {
        await program.methods
          .initializePool(invalidFeeTier)
          .accounts({
            pool: poolPDA,
            authority: authority.publicKey,
            tokenAMint: tokenAMint,
            tokenBMint: tokenBMint,
            tokenAVault: poolTokenA,
            tokenBVault: poolTokenB,
            lpMint: lpMintPDA,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .signers([authority])
          .rpc();
        
        assert.fail("Should have failed with invalid fee tier");
      } catch (error) {
        assert.include(error.toString(), "InvalidFeeTier");
        console.log("✅ Invalid fee tier properly rejected");
      }
    });
  });

  describe("Liquidity Operations", () => {
    it("Adds initial liquidity", async () => {
      await program.methods
        .addLiquidity(
          LIQUIDITY_AMOUNT_A,
          LIQUIDITY_AMOUNT_B,
          LIQUIDITY_AMOUNT_A,
          LIQUIDITY_AMOUNT_B
        )
        .accounts({
          pool: poolPDA,
          user: user.publicKey,
          userTokenA: userTokenA,
          userTokenB: userTokenB,
          poolTokenA: poolTokenA,
          poolTokenB: poolTokenB,
          userLpToken: userLpToken,
          lpMint: lpMintPDA,
          tokenAMint: tokenAMint,
          tokenBMint: tokenBMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      // Verify pool reserves
      const poolAccount = await program.account.liquidityPool.fetch(poolPDA);
      assert.equal(poolAccount.reserveA.toString(), LIQUIDITY_AMOUNT_A.toString());
      assert.equal(poolAccount.reserveB.toString(), LIQUIDITY_AMOUNT_B.toString());

      // Verify LP tokens were minted to user
      const userLpBalance = await getAccount(provider.connection, userLpToken);
      assert.ok(userLpBalance.amount > 0n);

      console.log("✅ Initial liquidity added successfully");
      console.log("User LP balance:", userLpBalance.amount.toString());
    });

    it("Adds additional liquidity", async () => {
      const additionalAmountA = new anchor.BN(50_000_000_000);
      const additionalAmountB = new anchor.BN(50_000_000_000);

      const poolBefore = await program.account.liquidityPool.fetch(poolPDA);
      const userLpBefore = await getAccount(provider.connection, userLpToken);

      await program.methods
        .addLiquidity(
          additionalAmountA,
          additionalAmountB,
          additionalAmountA.mul(new anchor.BN(95)).div(new anchor.BN(100)), // 5% slippage
          additionalAmountB.mul(new anchor.BN(95)).div(new anchor.BN(100))
        )
        .accounts({
          pool: poolPDA,
          user: user.publicKey,
          userTokenA: userTokenA,
          userTokenB: userTokenB,
          poolTokenA: poolTokenA,
          poolTokenB: poolTokenB,
          userLpToken: userLpToken,
          lpMint: lpMintPDA,
          tokenAMint: tokenAMint,
          tokenBMint: tokenBMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const poolAfter = await program.account.liquidityPool.fetch(poolPDA);
      const userLpAfter = await getAccount(provider.connection, userLpToken);

      // Verify reserves increased
      assert.ok(poolAfter.reserveA.gt(poolBefore.reserveA));
      assert.ok(poolAfter.reserveB.gt(poolBefore.reserveB));
      
      // Verify user received more LP tokens
      assert.ok(userLpAfter.amount > userLpBefore.amount);

      console.log("✅ Additional liquidity added successfully");
    });
  });

  describe("Swap Operations", () => {
    it("Performs a successful swap A → B", async () => {
      const swapAmount = new anchor.BN(1_000_000_000); // 1 token A
      const minimumAmountOut = new anchor.BN(900_000_000); // Accept at least 0.9 token B

      const poolBefore = await program.account.liquidityPool.fetch(poolPDA);
      const userTokenABefore = await getAccount(provider.connection, userTokenA);
      const userTokenBBefore = await getAccount(provider.connection, userTokenB);

      await program.methods
        .swap(swapAmount, minimumAmountOut)
        .accounts({
          pool: poolPDA,
          user: user.publicKey,
          userTokenIn: userTokenA,
          userTokenOut: userTokenB,
          poolTokenIn: poolTokenA,
          poolTokenOut: poolTokenB,
          tokenInMint: tokenAMint,
          tokenOutMint: tokenBMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const poolAfter = await program.account.liquidityPool.fetch(poolPDA);
      const userTokenAAfter = await getAccount(provider.connection, userTokenA);
      const userTokenBAfter = await getAccount(provider.connection, userTokenB);

      // Verify user balances changed correctly
      assert.equal(
        userTokenAAfter.amount,
        userTokenABefore.amount - BigInt(swapAmount.toString())
      );
      assert.ok(userTokenBAfter.amount > userTokenBBefore.amount);

      // Verify pool reserves changed
      assert.ok(poolAfter.reserveA.gt(poolBefore.reserveA));
      assert.ok(poolAfter.reserveB.lt(poolBefore.reserveB));

      // Verify fees were collected
      assert.ok(poolAfter.totalFeesCollected.gt(poolBefore.totalFeesCollected));

      console.log("✅ Swap A → B executed successfully");
      console.log("Fees collected:", poolAfter.totalFeesCollected.toString());
    });

    it("Performs a successful swap B → A", async () => {
      const swapAmount = new anchor.BN(1_000_000_000); // 1 token B
      const minimumAmountOut = new anchor.BN(900_000_000); // Accept at least 0.9 token A

      const poolBefore = await program.account.liquidityPool.fetch(poolPDA);
      
      await program.methods
        .swap(swapAmount, minimumAmountOut)
        .accounts({
          pool: poolPDA,
          user: user.publicKey,
          userTokenIn: userTokenB,
          userTokenOut: userTokenA,
          poolTokenIn: poolTokenB,
          poolTokenOut: poolTokenA,
          tokenInMint: tokenBMint,
          tokenOutMint: tokenAMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const poolAfter = await program.account.liquidityPool.fetch(poolPDA);

      // Verify pool reserves changed in opposite direction
      assert.ok(poolAfter.reserveB.gt(poolBefore.reserveB));
      assert.ok(poolAfter.reserveA.lt(poolBefore.reserveA));

      console.log("✅ Swap B → A executed successfully");
    });

    it("Fails swap with insufficient output", async () => {
      const swapAmount = new anchor.BN(1_000_000_000); // 1 token A
      const unrealisticMinimum = new anchor.BN(2_000_000_000); // Expect 2 tokens B (impossible)

      try {
        await program.methods
          .swap(swapAmount, unrealisticMinimum)
          .accounts({
            pool: poolPDA,
            user: user.publicKey,
            userTokenIn: userTokenA,
            userTokenOut: userTokenB,
            poolTokenIn: poolTokenA,
            poolTokenOut: poolTokenB,
            tokenInMint: tokenAMint,
            tokenOutMint: tokenBMint,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();
        
        assert.fail("Should have failed due to slippage");
      } catch (error) {
        assert.include(error.toString(), "SlippageExceeded");
        console.log("✅ High slippage properly rejected");
      }
    });
  });

  describe("Adaptive Fee System", () => {
    it("Updates fees based on price volatility", async () => {
      // Perform multiple swaps to create price history
      const swapAmount = new anchor.BN(500_000_000); // 0.5 tokens
      const minimumOut = new anchor.BN(400_000_000);

      for (let i = 0; i < 5; i++) {
        await program.methods
          .swap(swapAmount, minimumOut)
          .accounts({
            pool: poolPDA,
            user: user.publicKey,
            userTokenIn: i % 2 === 0 ? userTokenA : userTokenB,
            userTokenOut: i % 2 === 0 ? userTokenB : userTokenA,
            poolTokenIn: i % 2 === 0 ? poolTokenA : poolTokenB,
            poolTokenOut: i % 2 === 0 ? poolTokenB : poolTokenA,
            tokenInMint: i % 2 === 0 ? tokenAMint : tokenBMint,
            tokenOutMint: i % 2 === 0 ? tokenBMint : tokenAMint,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();

        // Add small delay to ensure different slots
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Update fees
      await program.methods
        .updateFees()
        .accounts({
          pool: poolPDA,
          caller: user.publicKey,
        })
        .signers([user])
        .rpc();

      const poolAfter = await program.account.liquidityPool.fetch(poolPDA);
      
      // Verify price history was updated
      assert.ok(poolAfter.historyIndex > 0);
      assert.ok(poolAfter.lastPrice.gt(new anchor.BN(0)));

      console.log("✅ Adaptive fees updated successfully");
      console.log("Current volatility fee:", poolAfter.volatilityFeeBps);
      console.log("Price history index:", poolAfter.historyIndex);
    });
  });

  describe("Remove Liquidity", () => {
    it("Removes partial liquidity", async () => {
      const userLpBalance = await getAccount(provider.connection, userLpToken);
      const liquidityToRemove = new anchor.BN(userLpBalance.amount.toString()).div(new anchor.BN(2)); // Remove half

      const poolBefore = await program.account.liquidityPool.fetch(poolPDA);
      const userTokenABefore = await getAccount(provider.connection, userTokenA);
      const userTokenBBefore = await getAccount(provider.connection, userTokenB);

      await program.methods
        .removeLiquidity(
          liquidityToRemove,
          new anchor.BN(1), // Minimum A (very low for test)
          new anchor.BN(1)  // Minimum B (very low for test)
        )
        .accounts({
          pool: poolPDA,
          user: user.publicKey,
          userTokenA: userTokenA,
          userTokenB: userTokenB,
          userLpToken: userLpToken,
          poolTokenA: poolTokenA,
          poolTokenB: poolTokenB,
          lpMint: lpMintPDA,
          tokenAMint: tokenAMint,
          tokenBMint: tokenBMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const poolAfter = await program.account.liquidityPool.fetch(poolPDA);
      const userTokenAAfter = await getAccount(provider.connection, userTokenA);
      const userTokenBAfter = await getAccount(provider.connection, userTokenB);
      const userLpAfter = await getAccount(provider.connection, userLpToken);

      // Verify pool reserves decreased
      assert.ok(poolAfter.reserveA.lt(poolBefore.reserveA));
      assert.ok(poolAfter.reserveB.lt(poolBefore.reserveB));

      // Verify user received tokens
      assert.ok(userTokenAAfter.amount > userTokenABefore.amount);
      assert.ok(userTokenBAfter.amount > userTokenBBefore.amount);

      // Verify LP tokens were burned
      assert.ok(userLpAfter.amount < userLpBalance.amount);

      console.log("✅ Partial liquidity removal successful");
    });
  });

  describe("Error Cases", () => {
    it("Fails to swap with zero amount", async () => {
      try {
        await program.methods
          .swap(new anchor.BN(0), new anchor.BN(1))
          .accounts({
            pool: poolPDA,
            user: user.publicKey,
            userTokenIn: userTokenA,
            userTokenOut: userTokenB,
            poolTokenIn: poolTokenA,
            poolTokenOut: poolTokenB,
            tokenInMint: tokenAMint,
            tokenOutMint: tokenBMint,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();
        
        assert.fail("Should have failed with zero amount");
      } catch (error) {
        assert.include(error.toString(), "InsufficientAmount");
        console.log("✅ Zero amount swap properly rejected");
      }
    });

    it("Fails to add liquidity with zero amounts", async () => {
      try {
        await program.methods
          .addLiquidity(
            new anchor.BN(0),
            new anchor.BN(0),
            new anchor.BN(0),
            new anchor.BN(0)
          )
          .accounts({
            pool: poolPDA,
            user: user.publicKey,
            userTokenA: userTokenA,
            userTokenB: userTokenB,
            poolTokenA: poolTokenA,
            poolTokenB: poolTokenB,
            userLpToken: userLpToken,
            lpMint: lpMintPDA,
            tokenAMint: tokenAMint,
            tokenBMint: tokenBMint,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();
        
        assert.fail("Should have failed with zero amounts");
      } catch (error) {
        assert.include(error.toString(), "InsufficientAmount");
        console.log("✅ Zero amount liquidity properly rejected");
      }
    });
  });

  describe("Performance Tests", () => {
    it("Handles multiple concurrent swaps", async () => {
      const swapPromises = [];
      const swapAmount = new anchor.BN(100_000_000); // 0.1 tokens
      const minOut = new anchor.BN(80_000_000); // 0.08 tokens

      // Create multiple swap transactions
      for (let i = 0; i < 5; i++) {
        const promise = program.methods
          .swap(swapAmount, minOut)
          .accounts({
            pool: poolPDA,
            user: user.publicKey,
            userTokenIn: i % 2 === 0 ? userTokenA : userTokenB,
            userTokenOut: i % 2 === 0 ? userTokenB : userTokenA,
            poolTokenIn: i % 2 === 0 ? poolTokenA : poolTokenB,
            poolTokenOut: i % 2 === 0 ? poolTokenB : poolTokenA,
            tokenInMint: i % 2 === 0 ? tokenAMint : tokenBMint,
            tokenOutMint: i % 2 === 0 ? tokenBMint : tokenAMint,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();
        
        swapPromises.push(promise);
      }

      // Execute all swaps
      const startTime = Date.now();
      const results = await Promise.allSettled(swapPromises);
      const endTime = Date.now();

      const successfulSwaps = results.filter(r => r.status === 'fulfilled').length;
      const executionTime = endTime - startTime;

      console.log(`✅ Executed ${successfulSwaps}/5 swaps in ${executionTime}ms`);
      assert.ok(successfulSwaps >= 3, "At least 3 swaps should succeed");
    });
  });
});