use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

use crate::error::SwapError;
use crate::state::LiquidityPool;

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(
        init,
        payer = authority,
        space = LiquidityPool::LEN,
        seeds = [b"pool", token_a_mint.key().as_ref(), token_b_mint.key().as_ref()],
        bump
    )]
    pub pool: Account<'info, LiquidityPool>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub token_a_mint: Account<'info, Mint>,
    pub token_b_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = authority,
        associated_token::mint = token_a_mint,
        associated_token::authority = pool
    )]
    pub token_a_vault: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = authority,
        associated_token::mint = token_b_mint,
        associated_token::authority = pool
    )]
    pub token_b_vault: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = authority,
        mint::decimals = 9,
        mint::authority = pool,
        seeds = [b"lp_mint", pool.key().as_ref()],
        bump
    )]
    pub lp_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<InitializePool>, fee_tier: u16) -> Result<()> {
    require!(fee_tier >= 5 && fee_tier <= 100, SwapError::InvalidFeeTier);
    require!(
        ctx.accounts.token_a_mint.key() != ctx.accounts.token_b_mint.key(),
        SwapError::IdenticalAddresses
    );

    let pool = &mut ctx.accounts.pool;
    
    pool.authority = ctx.accounts.authority.key();
    pool.token_a_mint = ctx.accounts.token_a_mint.key();
    pool.token_b_mint = ctx.accounts.token_b_mint.key();
    pool.token_a_vault = ctx.accounts.token_a_vault.key();
    pool.token_b_vault = ctx.accounts.token_b_vault.key();
    pool.lp_mint = ctx.accounts.lp_mint.key();
    
    pool.reserve_a = 0;
    pool.reserve_b = 0;
    
    pool.base_fee_bps = fee_tier;
    pool.volatility_fee_bps = 0;
    pool.last_price = 0;
    pool.last_update_slot = Clock::get()?.slot;
    pool.price_history = [0; 50];
    pool.history_index = 0;
    
    pool.total_volume_usd = 0;
    pool.total_fees_collected = 0;
    pool.created_at = Clock::get()?.unix_timestamp;
    pool.is_initialized = true;
    pool.is_locked = false;
    
    pool.bump = ctx.bumps.pool;

    msg!("Pool initialized with fee tier: {}", fee_tier);
    Ok(())
}