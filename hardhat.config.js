/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-ethers");

module.exports = {
  networks: {
    hardhat: {
      forking: {
	      url: "https://eth-mainnet.alchemyapi.io/v2/zx19VdoT5DKcilp0Fj7N4HrcwHFG7zQz",
      },
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/27618a4f70e5458eb800438a76dd5d1e",
      accounts: {
        mnemonic: "defense arrive cause first tonight pepper stable practice join loop dance scrub",
      }
    }
  },
  solidity: "0.8.11",
};
