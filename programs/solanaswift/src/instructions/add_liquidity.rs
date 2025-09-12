use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer, MintTo},
};

use crate::error::SwapError;
use crate::state::LiquidityPool;

#[derive(Accounts)]
#[instruction(amount_a_desired: u64, amount_b_desired: u64, amount_a_min: u64, amount_b_min: u64)]
pub struct AddLiquidity<'info> {
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
        associated_token::mint = token_a_mint,
        associated_token::authority = user
    )]
    pub user_token_a: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = token_b_mint,
        associated_token::authority = user
    )]
    pub user_token_b: Account<'info, TokenAccount>,

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
        init_if_needed,
        payer = user,
        associated_token::mint = lp_mint,
        associated_token::authority = user
    )]
    pub user_lp_token: Account<'info, TokenAccount>,

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
    ctx: Context<AddLiquidity>,
    amount_a_desired: u64,
    amount_b_desired: u64,
    amount_a_min: u64,
    amount_b_min: u64,
) -> Result<()> {
    require!(ctx.accounts.pool.is_initialized, SwapError::PoolNotInitialized);
    require!(amount_a_desired > 0 && amount_b_desired > 0, SwapError::InsufficientAmount);

    let pool = &mut ctx.accounts.pool;

    let (amount_a, amount_b, liquidity) = if pool.reserve_a == 0 && pool.reserve_b == 0 {
        // First liquidity provider
        let sqrt_product = ((amount_a_desired as u128)
            .checked_mul(amount_b_desired as u128)
            .ok_or(SwapError::MathOverflow)?)
            .integer_sqrt();

        require!(sqrt_product > 1000, SwapError::InsufficientLiquidity); // Minimum liquidity

        // Permanently lock first 1000 LP tokens by minting them to a burn address
        let initial_liquidity = sqrt_product - 1000;

        (amount_a_desired, amount_b_desired, initial_liquidity as u64)
    } else {
        // Subsequent liquidity providers
        let amount_b_optimal = quote(amount_a_desired, pool.reserve_a, pool.reserve_b)?;
        
        let (amount_a_final, amount_b_final) = if amount_b_optimal <= amount_b_desired {
            require!(amount_b_optimal >= amount_b_min, SwapError::InsufficientBAmount);
            (amount_a_desired, amount_b_optimal)
        } else {
            let amount_a_optimal = quote(amount_b_desired, pool.reserve_b, pool.reserve_a)?;
            require!(amount_a_optimal <= amount_a_desired, SwapError::InsufficientAmount);
            require!(amount_a_optimal >= amount_a_min, SwapError::InsufficientAAmount);
            (amount_a_optimal, amount_b_desired)
        };

        // Calculate liquidity to mint
        let total_supply = ctx.accounts.lp_mint.supply;
        let liquidity_a = (amount_a_final as u128)
            .checked_mul(total_supply as u128)
            .ok_or(SwapError::MathOverflow)?
            .checked_div(pool.reserve_a as u128)
            .ok_or(SwapError::MathOverflow)?;

        let liquidity_b = (amount_b_final as u128)
            .checked_mul(total_supply as u128)
            .ok_or(SwapError::MathOverflow)?
            .checked_div(pool.reserve_b as u128)
            .ok_or(SwapError::MathOverflow)?;

        let liquidity_to_mint = liquidity_a.min(liquidity_b) as u64;
        require!(liquidity_to_mint > 0, SwapError::InsufficientLiquidityBurned);

        (amount_a_final, amount_b_final, liquidity_to_mint)
    };

    // Transfer tokens from user to pool
    let transfer_a = Transfer {
        from: ctx.accounts.user_token_a.to_account_info(),
        to: ctx.accounts.pool_token_a.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    token::transfer(
        CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_a),
        amount_a,
    )?;

    let transfer_b = Transfer {
        from: ctx.accounts.user_token_b.to_account_info(),
        to: ctx.accounts.pool_token_b.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    token::transfer(
        CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_b),
        amount_b,
    )?;

    // Mint LP tokens to user
    let pool_seeds = &[
        b"pool",
        pool.token_a_mint.as_ref(),
        pool.token_b_mint.as_ref(),
        &[pool.bump],
    ];
    let signer_seeds = &[&pool_seeds[..]];

    let mint_to = MintTo {
        mint: ctx.accounts.lp_mint.to_account_info(),
        to: ctx.accounts.user_lp_token.to_account_info(),
        authority: pool.to_account_info(),
    };
    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            mint_to,
            signer_seeds,
        ),
        liquidity,
    )?;

    // Update pool reserves
    pool.reserve_a = pool.reserve_a.checked_add(amount_a).ok_or(SwapError::MathOverflow)?;
    pool.reserve_b = pool.reserve_b.checked_add(amount_b).ok_or(SwapError::MathOverflow)?;

    msg!(
        "Added liquidity: {} token A, {} token B, minted {} LP tokens",
        amount_a,
        amount_b,
        liquidity
    );

    Ok(())
}

// Helper function to calculate optimal amounts
fn quote(amount_a: u64, reserve_a: u64, reserve_b: u64) -> Result<u64> {
    require!(amount_a > 0, SwapError::InsufficientAmount);
    require!(reserve_a > 0 && reserve_b > 0, SwapError::InsufficientLiquidity);

    let amount_b = (amount_a as u128)
        .checked_mul(reserve_b as u128)
        .ok_or(SwapError::MathOverflow)?
        .checked_div(reserve_a as u128)
        .ok_or(SwapError::MathOverflow)? as u64;

    Ok(amount_b)
}

// Integer square root implementation
trait IntegerSquareRoot {
    fn integer_sqrt(self) -> u64;
}

impl IntegerSquareRoot for u128 {
    fn integer_sqrt(self) -> u64 {
        if self == 0 {
            return 0;
        }
        
        let mut x = self;
        let mut y = (self + 1) / 2;
        
        while y < x {
            x = y;
            y = (y + self / y) / 2;
        }
        
        x as u64
    }
}