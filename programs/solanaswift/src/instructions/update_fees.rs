use anchor_lang::prelude::*;

use crate::error::SwapError;
use crate::state::LiquidityPool;

#[derive(Accounts)]
pub struct UpdateFees<'info> {
    #[account(
        mut,
        seeds = [b"pool", pool.token_a_mint.as_ref(), pool.token_b_mint.as_ref()],
        bump = pool.bump
    )]
    pub pool: Account<'info, LiquidityPool>,

    #[account(address = pool.authority)]
    pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateFees>) -> Result<()> {
    require!(ctx.accounts.pool.is_initialized, SwapError::PoolNotInitialized);

    let pool = &mut ctx.accounts.pool;
    let current_slot = Clock::get()?.slot;

    // Only update fees if enough time has passed (at least 100 slots ≈ 40 seconds)
    require!(
        current_slot > pool.last_update_slot + 100,
        SwapError::InvalidAuthority
    );

    // Calculate new adaptive fee based on volatility
    let new_fee = pool.calculate_adaptive_fee();
    
    // Update fee if it changed significantly (at least 1 basis point difference)
    if (new_fee as i32 - pool.volatility_fee_bps as i32).abs() >= 1 {
        pool.volatility_fee_bps = new_fee;
        pool.last_update_slot = current_slot;

        msg!("Fees updated: new adaptive fee is {} bps", new_fee);
    } else {
        msg!("No fee update needed, current fee {} bps is optimal", new_fee);
    }

    Ok(())
}