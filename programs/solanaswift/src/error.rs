use anchor_lang::prelude::*;

#[error_code]
pub enum SwapError {
    #[msg("Pool is not initialized")]
    PoolNotInitialized,

    #[msg("Insufficient liquidity")]
    InsufficientLiquidity,

    #[msg("Slippage exceeded")]
    SlippageExceeded,

    #[msg("Invalid token mint")]
    InvalidTokenMint,

    #[msg("Insufficient amount")]
    InsufficientAmount,

    #[msg("Math overflow")]
    MathOverflow,

    #[msg("Identical addresses")]
    IdenticalAddresses,

    #[msg("Insufficient A amount")]
    InsufficientAAmount,

    #[msg("Insufficient B amount")]
    InsufficientBAmount,

    #[msg("Insufficient liquidity burned")]
    InsufficientLiquidityBurned,

    #[msg("Invalid authority")]
    InvalidAuthority,

    #[msg("Pool already initialized")]
    PoolAlreadyInitialized,

    #[msg("Invalid fee tier")]
    InvalidFeeTier,
}