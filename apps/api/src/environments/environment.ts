export const environment = {
  production: false,
  //EOS_NODE_URL: 'https://api-kylin.eosasia.one:443/v1/chain/get_table_rows',
  EOS_NODE_URL: 'https://mainnet.genereos.io:443/v1/chain/get_table_rows',
  PROPOSER: 'voter4survey',
  CONTRACT_NAME: 'eosforumrcpp',
  SYSTEM_CONTRACT_NAME: 'eosio',
  TABLE_NAME_PROPOSALS: 'proposal',
  TABLE_NAME_VOTES: 'vote',
  TABLE_NAME_PRODUCERS: 'producers',
  BLOCK_PRODUCER_TEST_LIST: [
    {
      'name': 'craccount111',
      'url': 'https://eos.chainrift.com/'
    },
    {
      'name': 'craccount112',
      'url': 'https://eos.chainrift.com/'
    },
    {
      'name': 'craccount113',
      'url': 'https://eos.chainrift.com/'
    }
  ]
};


