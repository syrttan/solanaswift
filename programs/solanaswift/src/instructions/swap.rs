use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Token, TokenAccount, Transfer},
};

use crate::error::SwapError;
use crate::state::LiquidityPool;

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(
        mut,
        seeds = [b"pool", pool.token_a_mint.as_ref(), pool.token_b_mint.as_ref()],
        bump = pool.bump
    )]
    pub pool: Account<'info, LiquidityPool>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        associated_token::mint = token_in_mint,
        associated_token::authority = user
    )]
    pub user_token_in: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = token_out_mint,
        associated_token::authority = user
    )]
    pub user_token_out: Account<'info, TokenAccount>,

    #[account(
        mut,
        address = pool.token_a_vault
    )]
    pub pool_token_in: Account<'info, TokenAccount>,

    #[account(
        mut,
        address = pool.token_b_vault
    )]
    pub pool_token_out: Account<'info, TokenAccount>,

    /// CHECK: Token mint validation through constraints
    pub token_in_mint: UncheckedAccount<'info>,
    /// CHECK: Token mint validation through constraints  
    pub token_out_mint: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Swap>, amount_in: u64, minimum_amount_out: u64) -> Result<()> {
    require!(ctx.accounts.pool.is_initialized, SwapError::PoolNotInitialized);
    require!(amount_in > 0, SwapError::InsufficientAmount);

    let pool = &mut ctx.accounts.pool;
    
    // Reentrancy guard
    pool.lock()?;
    
    // Determine swap direction
    let (reserve_in, reserve_out, is_a_to_b) = if ctx.accounts.token_in_mint.key() == pool.token_a_mint {
        (pool.reserve_a, pool.reserve_b, true)
    } else if ctx.accounts.token_in_mint.key() == pool.token_b_mint {
        (pool.reserve_b, pool.reserve_a, false)
    } else {
        return Err(SwapError::InvalidTokenMint.into());
    };

    require!(reserve_in > 0 && reserve_out > 0, SwapError::InsufficientLiquidity);

    // Calculate adaptive fee
    let fee_bps = pool.calculate_adaptive_fee();
    
    // Calculate output amount using constant product formula (x * y = k)
    let amount_in_with_fee = (amount_in as u128)
        .checked_mul(10000_u128.saturating_sub(fee_bps as u128))
        .ok_or(SwapError::MathOverflow)?
        .checked_div(10000)
        .ok_or(SwapError::MathOverflow)? as u64;

    let numerator = (amount_in_with_fee as u128)
        .checked_mul(reserve_out as u128)
        .ok_or(SwapError::MathOverflow)?;

    let denominator = (reserve_in as u128)
        .checked_add(amount_in_with_fee as u128)
        .ok_or(SwapError::MathOverflow)?;

    let amount_out = numerator
        .checked_div(denominator)
        .ok_or(SwapError::MathOverflow)? as u64;

    require!(amount_out >= minimum_amount_out, SwapError::SlippageExceeded);
    require!(amount_out < reserve_out, SwapError::InsufficientLiquidity);

    // Transfer tokens from user to pool
    let transfer_to_pool = Transfer {
        from: ctx.accounts.user_token_in.to_account_info(),
        to: ctx.accounts.pool_token_in.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    token::transfer(
        CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_to_pool),
        amount_in,
    )?;

    // Transfer tokens from pool to user using PDA authority
    let pool_seeds = &[
        b"pool",
        pool.token_a_mint.as_ref(),
        pool.token_b_mint.as_ref(),
        &[pool.bump],
    ];
    let signer_seeds = &[&pool_seeds[..]];

    let transfer_to_user = Transfer {
        from: ctx.accounts.pool_token_out.to_account_info(),
        to: ctx.accounts.user_token_out.to_account_info(),
        authority: pool.to_account_info(),
    };
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_to_user,
            signer_seeds,
        ),
        amount_out,
    )?;

    // Update pool reserves
    if is_a_to_b {
        pool.reserve_a = pool.reserve_a.checked_add(amount_in).ok_or(SwapError::MathOverflow)?;
        pool.reserve_b = pool.reserve_b.checked_sub(amount_out).ok_or(SwapError::MathOverflow)?;
    } else {
        pool.reserve_b = pool.reserve_b.checked_add(amount_in).ok_or(SwapError::MathOverflow)?;
        pool.reserve_a = pool.reserve_a.checked_sub(amount_out).ok_or(SwapError::MathOverflow)?;
    }

    // Update price history for adaptive fees
    let current_price = if pool.reserve_a > 0 {
        (pool.reserve_b as u128)
            .checked_mul(1_000_000_000) // Scale for precision
            .ok_or(SwapError::MathOverflow)?
            .checked_div(pool.reserve_a as u128)
            .ok_or(SwapError::MathOverflow)? as u64
    } else {
        0
    };
    
    pool.update_price_history(current_price);
    pool.last_update_slot = Clock::get()?.slot;

    // Update statistics
    let fee_amount = amount_in.checked_sub(amount_in_with_fee).ok_or(SwapError::MathOverflow)?;
    pool.total_fees_collected = pool.total_fees_collected.checked_add(fee_amount).ok_or(SwapError::MathOverflow)?;

    msg!(
        "Swapped {} for {} (fee: {} bps, actual fee: {})",
        amount_in,
        amount_out,
        fee_bps,
        fee_amount
    );

    // Unlock before returning
    pool.unlock();

    Ok(())
}