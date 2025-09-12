use anchor_lang::prelude::*;

#[account]
pub struct LiquidityPool {
    pub authority: Pubkey,
    pub token_a_mint: Pubkey,
    pub token_b_mint: Pubkey,
    pub token_a_vault: Pubkey,
    pub token_b_vault: Pubkey,
    pub lp_mint: Pubkey,
    
    // Reserves
    pub reserve_a: u64,
    pub reserve_b: u64,
    
    // Adaptive Fee Parameters
    pub base_fee_bps: u16,           // Base fee in basis points (30 = 0.3%)
    pub volatility_fee_bps: u16,     // Additional fee based on volatility
    pub last_price: u64,             // Last recorded price
    pub last_update_slot: u64,       // Last update slot
    pub price_history: [u64; 50],    // Price history for volatility calculation
    pub history_index: u8,           // Current index in price history
    
    // Statistics
    pub total_volume_usd: u128,      // Total volume traded
    pub total_fees_collected: u64,   // Total fees collected
    pub created_at: i64,             // Creation timestamp
    pub is_initialized: bool,        // Pool initialization flag
    
    pub bump: u8,                    // PDA bump seed
}

impl LiquidityPool {
    pub const LEN: usize = 8 + 32 * 6 + 8 * 4 + 2 * 2 + 8 * 52 + 1 + 16 + 8 + 8 + 1 + 1;

    pub fn calculate_adaptive_fee(&self) -> u16 {
        if self.history_index < 5 {
            return self.base_fee_bps;
        }

        let volatility = self.calculate_volatility();
        let volatility_multiplier = (1.0 + volatility * 2.0).min(3.0);
        
        let adaptive_fee = (self.base_fee_bps as f64 * volatility_multiplier) as u16;
        adaptive_fee.min(100) // Max 1% fee
    }

    fn calculate_volatility(&self) -> f64 {
        if self.history_index < 5 {
            return 0.0;
        }

        let mut returns = Vec::new();
        let count = self.history_index.min(49) as usize;
        
        for i in 1..count {
            let current = self.price_history[i] as f64;
            let previous = self.price_history[i - 1] as f64;
            
            if previous > 0.0 {
                let return_rate = (current - previous) / previous;
                returns.push(return_rate);
            }
        }

        if returns.is_empty() {
            return 0.0;
        }

        let mean: f64 = returns.iter().sum::<f64>() / returns.len() as f64;
        let variance: f64 = returns
            .iter()
            .map(|&x| (x - mean).powi(2))
            .sum::<f64>() / returns.len() as f64;

        variance.sqrt()
    }

    pub fn update_price_history(&mut self, new_price: u64) {
        let index = (self.history_index as usize) % 50;
        self.price_history[index] = new_price;
        self.history_index = ((self.history_index as usize + 1) % 50) as u8;
        self.last_price = new_price;
    }
}

impl Default for LiquidityPool {
    fn default() -> Self {
        Self {
            authority: Pubkey::default(),
            token_a_mint: Pubkey::default(),
            token_b_mint: Pubkey::default(),
            token_a_vault: Pubkey::default(),
            token_b_vault: Pubkey::default(),
            lp_mint: Pubkey::default(),
            reserve_a: 0,
            reserve_b: 0,
            base_fee_bps: 0,
            volatility_fee_bps: 0,
            last_price: 0,
            last_update_slot: 0,
            price_history: [0; 50],
            history_index: 0,
            total_volume_usd: 0,
            total_fees_collected: 0,
            created_at: 0,
            is_initialized: false,
            bump: 0,
        }
    }
}

#[account]
#[derive(Default)]
pub struct UserPosition {
    pub owner: Pubkey,
    pub pool: Pubkey,
    pub lp_token_balance: u64,
    pub deposited_a: u64,
    pub deposited_b: u64,
    pub earned_fees: u64,
    pub last_interaction: i64,
    pub bump: u8,
}

impl UserPosition {
    pub const LEN: usize = 8 + 32 * 2 + 8 * 4 + 8 + 1;
}