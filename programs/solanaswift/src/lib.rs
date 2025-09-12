use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer},
};

pub mod error;
pub mod instructions;
pub mod state;

use error::*;
use instructions::*;
use state::*;

declare_id!("11111111111111111111111111111112");

#[program]
pub mod solanaswift {
    use super::*;

    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        fee_tier: u16,
    ) -> Result<()> {
        instructions::initialize_pool::handler(ctx, fee_tier)
    }

    pub fn swap(
        ctx: Context<Swap>,
        amount_in: u64,
        minimum_amount_out: u64,
    ) -> Result<()> {
        instructions::swap::handler(ctx, amount_in, minimum_amount_out)
    }

    pub fn add_liquidity(
        ctx: Context<AddLiquidity>,
        amount_a_desired: u64,
        amount_b_desired: u64,
        amount_a_min: u64,
        amount_b_min: u64,
    ) -> Result<()> {
        instructions::add_liquidity::handler(
            ctx,
            amount_a_desired,
            amount_b_desired,
            amount_a_min,
            amount_b_min,
        )
    }

    pub fn remove_liquidity(
        ctx: Context<RemoveLiquidity>,
        liquidity: u64,
        amount_a_min: u64,
        amount_b_min: u64,
    ) -> Result<()> {
        instructions::remove_liquidity::handler(ctx, liquidity, amount_a_min, amount_b_min)
    }

    pub fn update_fees(ctx: Context<UpdateFees>) -> Result<()> {
        instructions::update_fees::handler(ctx)
    }
}