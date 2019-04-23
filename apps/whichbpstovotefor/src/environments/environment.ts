export const environment = {
  production: false,
  URL: "http://localhost:" + (process.env.PORT || 3333)
};

// ** EOS Mainnet **
export const network = {
  blockchain: 'eos',
  protocol: 'https',
  host: 'nodes.get-scatter.com',
  port: 443,
  chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'
};

export const contractName = "eosio.forum";
