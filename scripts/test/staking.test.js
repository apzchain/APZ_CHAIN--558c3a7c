const { expect } = require("chai");
const { ethers } = require("hardhat");

async function increaseTime(seconds) {
  await ethers.provider.send("evm_increaseTime", [seconds]);
  await ethers.provider.send("evm_mine");
}

describe("Staking", function () {
  let apzToken, staking, owner, user1, user2;
  const INITIAL_SUPPLY = ethers.parseUnits("1000000", 18);
  const REWARD_RATE = ethers.parseUnits("1", 18); // 1 APZ per second
  const REWARD_POOL = ethers.parseUnits("100000", 18);

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const APZToken = await ethers.getContractFactory("APZToken");
    apzToken = await APZToken.deploy(INITIAL_SUPPLY);
    await apzToken.waitForDeployment();

    const Staking = await ethers.getContractFactory("Staking");
    staking = await Staking.deploy(
      await apzToken.getAddress(),
      await apzToken.getAddress(),
      REWARD_RATE
    );
    await staking.waitForDeployment();

    // تأمین پاداش
    await apzToken.transfer(await staking.getAddress(), REWARD_POOL);

    // توزیع توکن بین کاربران
    await apzToken.transfer(user1.address, ethers.parseUnits("10000", 18));
    await apzToken.transfer(user2.address, ethers.parseUnits("10000", 18));
  });

  it("should stake and earn rewards", async function () {
    const stakeAmount = ethers.parseUnits("1000", 18);
    await apzToken.connect(user1).approve(await staking.getAddress(), stakeAmount);
    await staking.connect(user1).stake(stakeAmount);

    expect(await staking.balances(user1.address)).to.equal(stakeAmount);
    expect(await staking.totalStaked()).to.equal(stakeAmount);

    await increaseTime(10);

    const earned = await staking.earned(user1.address);
    // ۱۰ ثانیه * ۱ APZ/ثانیه = ۱۰ APZ
    expect(earned).to.be.closeTo(
      ethers.parseUnits("10", 18),
      ethers.parseUnits("0.1", 18)
    );

    await staking.connect(user1).claimReward();
    const balanceAfter = await apzToken.balanceOf(user1.address);
    // 10000 - 1000 + 10 = 9010
    expect(balanceAfter).to.be.closeTo(
      ethers.parseUnits("9010", 18),
      ethers.parseUnits("0.1", 18)
    );
  });

  it("should split rewards proportionally", async function () {
    const stake1 = ethers.parseUnits("1000", 18);
    const stake2 = ethers.parseUnits("3000", 18);

    await apzToken.connect(user1).approve(await staking.getAddress(), stake1);
    await staking.connect(user1).stake(stake1);

    await apzToken.connect(user2).approve(await staking.getAddress(), stake2);
    await staking.connect(user2).stake(stake2);

    await increaseTime(10);

    const earned1 = await staking.earned(user1.address);
    const earned2 = await staking.earned(user2.address);

    // مجموع پاداش ۱۰ ثانیه = ۱۰ APZ. سهم user1 = 1/4 و user2 = 3/4
    expect(earned1).to.be.closeTo(
      ethers.parseUnits("2.5", 18),
      ethers.parseUnits("0.1", 18)
    );
    expect(earned2).to.be.closeTo(
      ethers.parseUnits("7.5", 18),
      ethers.parseUnits("0.1", 18)
    );
  });
});
