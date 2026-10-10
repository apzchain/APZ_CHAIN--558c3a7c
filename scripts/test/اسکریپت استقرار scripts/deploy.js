const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // 1. استقرار توکن APZ با ۱ میلیون واحد اولیه
  const initialSupply = ethers.parseUnits("1000000", 18);
  const APZToken = await ethers.getContractFactory("APZToken");
  const apzToken = await APZToken.deploy(initialSupply);
  await apzToken.waitForDeployment();
  const tokenAddress = await apzToken.getAddress();
  console.log("APZToken deployed to:", tokenAddress);

  // 2. استقرار قرارداد Staking با نرخ پاداش ۱ APZ در ثانیه
  const rewardRate = ethers.parseUnits("1", 18); // 1 APZ per second
  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(tokenAddress, tokenAddress, rewardRate);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("Staking deployed to:", stakingAddress);

  // 3. انتقال ۱۰۰,۰۰۰ APZ به قرارداد Staking برای پرداخت پاداش‌ها
  const rewardPool = ethers.parseUnits("100000", 18);
  await apzToken.transfer(stakingAddress, rewardPool);
  console.log("Transferred 100000 APZ to Staking for rewards");

  // 4. استیک کردن ۱۰۰۰ APZ از حساب دیپلویر برای تست
  const stakeAmount = ethers.parseUnits("1000", 18);
  await apzToken.approve(stakingAddress, stakeAmount);
  await staking.stake(stakeAmount);
  console.log("Deployer staked 1000 APZ");

  console.log("\n✅ Deployment completed!");
  console.log("TOKEN_ADDRESS=" + tokenAddress);
  console.log("STAKING_ADDRESS=" + stakingAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
