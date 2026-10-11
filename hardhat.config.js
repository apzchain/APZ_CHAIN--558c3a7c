require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // برای خواندن فایل .env

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    // شبکه لوکال (برای تست‌های قبلی)
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337
    },
    // شبکه تست Sepolia
    sepolia: {
      // می‌توانید از RPC عمومی یا اختصاصی استفاده کنید
      url: process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.api.onfinality.io/public",
      accounts: [process.env.SEPOLIA_PRIVATE_KEY],
      chainId: 11155111 // Chain ID استاندارد Sepolia
    }
  },
  etherscan: {
    // برای تأیید قراردادها (اختیاری)
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || ""
    }
  }
};
