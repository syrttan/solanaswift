// Type definitions for SolanaSwift IDL
export type SolanaSwift = {
  "version": "0.1.0",
  "name": "solanaswift",
  "instructions": [
    {
      "name": "initializePool",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenAMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenBMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenAVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenBVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lpMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "feeTier",
          "type": "u16"
        }
      ]
    },
    {
      "name": "swap",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "userTokenIn",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenOut",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolTokenIn",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolTokenOut",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenInMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenOutMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountIn",
          "type": "u64"
        },
        {
          "name": "minimumAmountOut",
          "type": "u64"
        }
      ]
    },
    {
      "name": "addLiquidity",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userTokenA",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenB",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolTokenA",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolTokenB",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userLpToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lpMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenBMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountADesired",
          "type": "u64"
        },
        {
          "name": "amountBDesired",
          "type": "u64"
        },
        {
          "name": "amountAMin",
          "type": "u64"
        },
        {
          "name": "amountBMin",
          "type": "u64"
        }
      ]
    },
    {
      "name": "removeLiquidity",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userTokenA",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenB",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userLpToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolTokenA",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolTokenB",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lpMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenBMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "liquidity",
          "type": "u64"
        },
        {
          "name": "amountAMin",
          "type": "u64"
        },
        {
          "name": "amountBMin",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateFees",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "caller",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "liquidityPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "tokenAMint",
            "type": "publicKey"
          },
          {
            "name": "tokenBMint", 
            "type": "publicKey"
          },
          {
            "name": "tokenAVault",
            "type": "publicKey"
          },
          {
            "name": "tokenBVault",
            "type": "publicKey"
          },
          {
            "name": "lpMint",
            "type": "publicKey"
          },
          {
            "name": "reserveA",
            "type": "u64"
          },
          {
            "name": "reserveB",
            "type": "u64"
          },
          {
            "name": "baseFeeBps",
            "type": "u16"
          },
          {
            "name": "volatilityFeeBps",
            "type": "u16"
          },
          {
            "name": "lastPrice",
            "type": "u64"
          },
          {
            "name": "lastUpdateSlot",
            "type": "u64"
          },
          {
            "name": "priceHistory",
            "type": {
              "array": ["u64", 50]
            }
          },
          {
            "name": "historyIndex",
            "type": "u8"
          },
          {
            "name": "totalVolumeUsd",
            "type": "u128"
          },
          {
            "name": "totalFeesCollected",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "isInitialized",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "userPosition",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "lpTokenBalance",
            "type": "u64"
          },
          {
            "name": "depositedA",
            "type": "u64"
          },
          {
            "name": "depositedB",
            "type": "u64"
          },
          {
            "name": "earnedFees",
            "type": "u64"
          },
          {
            "name": "lastInteraction",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "PoolNotInitialized",
      "msg": "Pool is not initialized"
    },
    {
      "code": 6001,
      "name": "InsufficientLiquidity",
      "msg": "Insufficient liquidity"
    },
    {
      "code": 6002,
      "name": "SlippageExceeded",
      "msg": "Slippage exceeded"
    },
    {
      "code": 6003,
      "name": "InvalidTokenMint",
      "msg": "Invalid token mint"
    },
    {
      "code": 6004,
      "name": "InsufficientAmount",
      "msg": "Insufficient amount"
    },
    {
      "code": 6005,
      "name": "MathOverflow",
      "msg": "Math overflow"
    },
    {
      "code": 6006,
      "name": "IdenticalAddresses",
      "msg": "Identical addresses"
    },
    {
      "code": 6007,
      "name": "InsufficientAAmount",
      "msg": "Insufficient A amount"
    },
    {
      "code": 6008,
      "name": "InsufficientBAmount",
      "msg": "Insufficient B amount"
    },
    {
      "code": 6009,
      "name": "InsufficientLiquidityBurned",
      "msg": "Insufficient liquidity burned"
    },
    {
      "code": 6010,
      "name": "InvalidAuthority",
      "msg": "Invalid authority"
    },
    {
      "code": 6011,
      "name": "PoolAlreadyInitialized",
      "msg": "Pool already initialized"
    },
    {
      "code": 6012,
      "name": "InvalidFeeTier",
      "msg": "Invalid fee tier"
    }
  ]
};

export const IDL: SolanaSwift = {
  "version": "0.1.0",
  "name": "solanaswift",
  "instructions": [
    {
      "name": "initializePool",
      "accounts": [
        { "name": "pool", "isMut": true, "isSigner": false },
        { "name": "authority", "isMut": true, "isSigner": true },
        { "name": "tokenAMint", "isMut": false, "isSigner": false },
        { "name": "tokenBMint", "isMut": false, "isSigner": false },
        { "name": "tokenAVault", "isMut": true, "isSigner": false },
        { "name": "tokenBVault", "isMut": true, "isSigner": false },
        { "name": "lpMint", "isMut": true, "isSigner": false },
        { "name": "tokenProgram", "isMut": false, "isSigner": false },
        { "name": "associatedTokenProgram", "isMut": false, "isSigner": false },
        { "name": "systemProgram", "isMut": false, "isSigner": false },
        { "name": "rent", "isMut": false, "isSigner": false }
      ],
      "args": [{ "name": "feeTier", "type": "u16" }]
    },
    {
      "name": "swap",
      "accounts": [
        { "name": "pool", "isMut": true, "isSigner": false },
        { "name": "user", "isMut": false, "isSigner": true },
        { "name": "userTokenIn", "isMut": true, "isSigner": false },
        { "name": "userTokenOut", "isMut": true, "isSigner": false },
        { "name": "poolTokenIn", "isMut": true, "isSigner": false },
        { "name": "poolTokenOut", "isMut": true, "isSigner": false },
        { "name": "tokenInMint", "isMut": false, "isSigner": false },
        { "name": "tokenOutMint", "isMut": false, "isSigner": false },
        { "name": "tokenProgram", "isMut": false, "isSigner": false },
        { "name": "associatedTokenProgram", "isMut": false, "isSigner": false },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "amountIn", "type": "u64" },
        { "name": "minimumAmountOut", "type": "u64" }
      ]
    },
    {
      "name": "addLiquidity",
      "accounts": [
        { "name": "pool", "isMut": true, "isSigner": false },
        { "name": "user", "isMut": true, "isSigner": true },
        { "name": "userTokenA", "isMut": true, "isSigner": false },
        { "name": "userTokenB", "isMut": true, "isSigner": false },
        { "name": "poolTokenA", "isMut": true, "isSigner": false },
        { "name": "poolTokenB", "isMut": true, "isSigner": false },
        { "name": "userLpToken", "isMut": true, "isSigner": false },
        { "name": "lpMint", "isMut": true, "isSigner": false },
        { "name": "tokenAMint", "isMut": false, "isSigner": false },
        { "name": "tokenBMint", "isMut": false, "isSigner": false },
        { "name": "tokenProgram", "isMut": false, "isSigner": false },
        { "name": "associatedTokenProgram", "isMut": false, "isSigner": false },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "amountADesired", "type": "u64" },
        { "name": "amountBDesired", "type": "u64" },
        { "name": "amountAMin", "type": "u64" },
        { "name": "amountBMin", "type": "u64" }
      ]
    },
    {
      "name": "removeLiquidity",
      "accounts": [
        { "name": "pool", "isMut": true, "isSigner": false },
        { "name": "user", "isMut": true, "isSigner": true },
        { "name": "userTokenA", "isMut": true, "isSigner": false },
        { "name": "userTokenB", "isMut": true, "isSigner": false },
        { "name": "userLpToken", "isMut": true, "isSigner": false },
        { "name": "poolTokenA", "isMut": true, "isSigner": false },
        { "name": "poolTokenB", "isMut": true, "isSigner": false },
        { "name": "lpMint", "isMut": true, "isSigner": false },
        { "name": "tokenAMint", "isMut": false, "isSigner": false },
        { "name": "tokenBMint", "isMut": false, "isSigner": false },
        { "name": "tokenProgram", "isMut": false, "isSigner": false },
        { "name": "associatedTokenProgram", "isMut": false, "isSigner": false },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "liquidity", "type": "u64" },
        { "name": "amountAMin", "type": "u64" },
        { "name": "amountBMin", "type": "u64" }
      ]
    },
    {
      "name": "updateFees",
      "accounts": [
        { "name": "pool", "isMut": true, "isSigner": false },
        { "name": "caller", "isMut": false, "isSigner": true }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "liquidityPool",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "authority", "type": "publicKey" },
          { "name": "tokenAMint", "type": "publicKey" },
          { "name": "tokenBMint", "type": "publicKey" },
          { "name": "tokenAVault", "type": "publicKey" },
          { "name": "tokenBVault", "type": "publicKey" },
          { "name": "lpMint", "type": "publicKey" },
          { "name": "reserveA", "type": "u64" },
          { "name": "reserveB", "type": "u64" },
          { "name": "baseFeeBps", "type": "u16" },
          { "name": "volatilityFeeBps", "type": "u16" },
          { "name": "lastPrice", "type": "u64" },
          { "name": "lastUpdateSlot", "type": "u64" },
          { "name": "priceHistory", "type": { "array": ["u64", 50] } },
          { "name": "historyIndex", "type": "u8" },
          { "name": "totalVolumeUsd", "type": "u128" },
          { "name": "totalFeesCollected", "type": "u64" },
          { "name": "createdAt", "type": "i64" },
          { "name": "isInitialized", "type": "bool" },
          { "name": "bump", "type": "u8" }
        ]
      }
    },
    {
      "name": "userPosition",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "owner", "type": "publicKey" },
          { "name": "pool", "type": "publicKey" },
          { "name": "lpTokenBalance", "type": "u64" },
          { "name": "depositedA", "type": "u64" },
          { "name": "depositedB", "type": "u64" },
          { "name": "earnedFees", "type": "u64" },
          { "name": "lastInteraction", "type": "i64" },
          { "name": "bump", "type": "u8" }
        ]
      }
    }
  ],
  "errors": [
    { "code": 6000, "name": "PoolNotInitialized", "msg": "Pool is not initialized" },
    { "code": 6001, "name": "InsufficientLiquidity", "msg": "Insufficient liquidity" },
    { "code": 6002, "name": "SlippageExceeded", "msg": "Slippage exceeded" },
    { "code": 6003, "name": "InvalidTokenMint", "msg": "Invalid token mint" },
    { "code": 6004, "name": "InsufficientAmount", "msg": "Insufficient amount" },
    { "code": 6005, "name": "MathOverflow", "msg": "Math overflow" },
    { "code": 6006, "name": "IdenticalAddresses", "msg": "Identical addresses" },
    { "code": 6007, "name": "InsufficientAAmount", "msg": "Insufficient A amount" },
    { "code": 6008, "name": "InsufficientBAmount", "msg": "Insufficient B amount" },
    { "code": 6009, "name": "InsufficientLiquidityBurned", "msg": "Insufficient liquidity burned" },
    { "code": 6010, "name": "InvalidAuthority", "msg": "Invalid authority" },
    { "code": 6011, "name": "PoolAlreadyInitialized", "msg": "Pool already initialized" },
    { "code": 6012, "name": "InvalidFeeTier", "msg": "Invalid fee tier" }
  ]
};