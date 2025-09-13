// Mock для @solana/web3.js
export class PublicKey {
  constructor(value) {
    this._bn = value;
  }
  
  toString() {
    return 'test-public-key';
  }
  
  toBase58() {
    return 'test-public-key';
  }
  
  static findProgramAddressSync(seeds, programId) {
    return [new PublicKey('test-pda'), 255];
  }
}

export class Connection {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }
  
  async getAccountInfo() {
    return null;
  }
}

export class Keypair {
  static generate() {
    return new Keypair();
  }
  
  get publicKey() {
    return new PublicKey('test-keypair-pubkey');
  }
}

export const SystemProgram = {
  programId: new PublicKey('system-program'),
};

export const clusterApiUrl = (network) => `https://api.${network}.solana.com`;

export default {
  PublicKey,
  Connection,
  Keypair,
  SystemProgram,
  clusterApiUrl,
};
