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
    }
  ],
  "errors": [
    { "code": 6000, "name": "PoolNotInitialized", "msg": "Pool is not initialized" },
    { "code": 6001, "name": "InsufficientLiquidity", "msg": "Insufficient liquidity" },
    { "code": 6002, "name": "SlippageExceeded", "msg": "Slippage exceeded" },
    { "code": 6003, "name": "InvalidTokenMint", "msg": "Invalid token mint" },
    { "code": 6004, "name": "InsufficientAmount", "msg": "Insufficient amount" },
    { "code": 6005, "name": "MathOverflow", "msg": "Math overflow" }
  ]
};