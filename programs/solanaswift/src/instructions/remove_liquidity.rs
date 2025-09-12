use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer, Burn},
};

use crate::error::SwapError;
use crate::state::LiquidityPool;

#[derive(Accounts)]
#[instruction(liquidity: u64, amount_a_min: u64, amount_b_min: u64)]
pub struct RemoveLiquidity<'info> {
    #[account(
        mut,
        seeds = [b"pool", pool.token_a_mint.as_ref(), pool.token_b_mint.as_ref()],
        bump = pool.bump
    )]
    pub pool: Account<'info, LiquidityPool>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = token_a_mint,
        associated_token::authority = user
    )]
    pub user_token_a: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = token_b_mint,
        associated_token::authority = user
    )]
    pub user_token_b: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = lp_mint,
        associated_token::authority = user
    )]
    pub user_lp_token: Account<'info, TokenAccount>,

    #[account(
        mut,
        address = pool.token_a_vault
    )]
    pub pool_token_a: Account<'info, TokenAccount>,

    #[account(
        mut,
        address = pool.token_b_vault
    )]
    pub pool_token_b: Account<'info, TokenAccount>,

    #[account(
        mut,
        address = pool.lp_mint
    )]
    pub lp_mint: Account<'info, Mint>,

    /// CHECK: Validated through pool state
    pub token_a_mint: UncheckedAccount<'info>,
    /// CHECK: Validated through pool state
    pub token_b_mint: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<RemoveLiquidity>,
    liquidity: u64,
    amount_a_min: u64,
    amount_b_min: u64,
) -> Result<()> {
    require!(ctx.accounts.pool.is_initialized, SwapError::PoolNotInitialized);
    require!(liquidity > 0, SwapError::InsufficientLiquidityBurned);

    let pool = &mut ctx.accounts.pool;
    let total_supply = ctx.accounts.lp_mint.supply;

    require!(total_supply > 0, SwapError::InsufficientLiquidity);
    require!(
        ctx.accounts.user_lp_token.amount >= liquidity,
        SwapError::InsufficientLiquidityBurned
    );

    // Calculate amounts to withdraw
    let amount_a = (liquidity as u128)
        .checked_mul(pool.reserve_a as u128)
        .ok_or(SwapError::MathOverflow)?
        .checked_div(total_supply as u128)
        .ok_or(SwapError::MathOverflow)? as u64;

    let amount_b = (liquidity as u128)
        .checked_mul(pool.reserve_b as u128)
        .ok_or(SwapError::MathOverflow)?
        .checked_div(total_supply as u128)
        .ok_or(SwapError::MathOverflow)? as u64;

    require!(amount_a >= amount_a_min, SwapError::InsufficientAAmount);
    require!(amount_b >= amount_b_min, SwapError::InsufficientBAmount);

    require!(
        amount_a <= pool.reserve_a && amount_b <= pool.reserve_b,
        SwapError::InsufficientLiquidity
    );

    // Burn LP tokens from user
    let burn = Burn {
        mint: ctx.accounts.lp_mint.to_account_info(),
        from: ctx.accounts.user_lp_token.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    token::burn(
        CpiContext::new(ctx.accounts.token_program.to_account_info(), burn),
        liquidity,
    )?;

    // Transfer tokens from pool to user
    let pool_seeds = &[
        b"pool",
        pool.token_a_mint.as_ref(),
        pool.token_b_mint.as_ref(),
        &[pool.bump],
    ];
    let signer_seeds = &[&pool_seeds[..]];

    let transfer_a = Transfer {
        from: ctx.accounts.pool_token_a.to_account_info(),
        to: ctx.accounts.user_token_a.to_account_info(),
        authority: pool.to_account_info(),
    };
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_a,
            signer_seeds,
        ),
        amount_a,
    )?;

    let transfer_b = Transfer {
        from: ctx.accounts.pool_token_b.to_account_info(),
        to: ctx.accounts.user_token_b.to_account_info(),
        authority: pool.to_account_info(),
    };
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_b,
            signer_seeds,
        ),
        amount_b,
    )?;

    // Update pool reserves
    pool.reserve_a = pool.reserve_a.checked_sub(amount_a).ok_or(SwapError::MathOverflow)?;
    pool.reserve_b = pool.reserve_b.checked_sub(amount_b).ok_or(SwapError::MathOverflow)?;

    msg!(
        "Removed liquidity: {} LP tokens burned, {} token A, {} token B withdrawn",
        liquidity,
        amount_a,
        amount_b
    );

    Ok(())
}