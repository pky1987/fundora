import { expect } from "chai";
import hre from "hardhat";
import { parseEther } from "viem";

describe("CrowdFunding", function () {
  let crowdFunding;
  let owner, donor1, donor2;
  let publicClient;

  beforeEach(async function () {
    const clients = await hre.viem.getWalletClients();
    [owner, donor1, donor2] = clients;

    crowdFunding = await hre.viem.deployContract("CrowdFunding");
    publicClient = await hre.viem.getPublicClient();
  });

  it("Should create a campaign", async function () {
    const title = "Test Campaign";
    const description = "A test campaign";
    const target = parseEther("1");
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 86400);
    const image = "test.jpg";

    const hash = await crowdFunding.write.createCampaign(
      [owner.account.address, title, description, target, deadline, image],
      { account: owner.account }
    );
    await publicClient.waitForTransactionReceipt({ hash });

    const campaign = await crowdFunding.read.campaigns([0n]);
    expect(campaign.title).to.equal(title);
    expect(campaign.description).to.equal(description);
    expect(campaign.target).to.equal(target);
    expect(campaign.deadline).to.equal(deadline);
    expect(campaign.owner.toLowerCase()).to.equal(
      owner.account.address.toLowerCase()
    );
  });

  it("Should allow donations to a campaign", async function () {
    const title = "Test Campaign";
    const description = "A test campaign";
    const target = parseEther("1");
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 86400);
    const image = "test.jpg";

    let hash = await crowdFunding.write.createCampaign(
      [owner.account.address, title, description, target, deadline, image],
      { account: owner.account }
    );
    await publicClient.waitForTransactionReceipt({ hash });

    const donationAmount = parseEther("0.5");
    hash = await crowdFunding.write.donateToCampaign([0n], {
      value: donationAmount,
      account: donor1.account,
    });
    await publicClient.waitForTransactionReceipt({ hash });

    const campaign = await crowdFunding.read.campaigns([0n]);
    expect(campaign.amountCollected).to.equal(donationAmount);

    const [donators, donations] = await crowdFunding.read.getDonators([0n]);
    expect(donators[0].toLowerCase()).to.equal(
      donor1.account.address.toLowerCase()
    );
    expect(donations[0]).to.equal(donationAmount);
  });

  it("Should return all campaigns", async function () {
    const title1 = "Campaign 1";
    const title2 = "Campaign 2";
    const description = "A test campaign";
    const target = parseEther("1");
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 86400);
    const image = "test.jpg";

    let hash = await crowdFunding.write.createCampaign(
      [owner.account.address, title1, description, target, deadline, image],
      { account: owner.account }
    );
    await publicClient.waitForTransactionReceipt({ hash });

    hash = await crowdFunding.write.createCampaign(
      [owner.account.address, title2, description, target, deadline, image],
      { account: owner.account }
    );
    await publicClient.waitForTransactionReceipt({ hash });

    const allCampaigns = await crowdFunding.read.getCampaigns();
    expect(allCampaigns.length).to.equal(2);
    expect(allCampaigns[0].title).to.equal(title1);
    expect(allCampaigns[1].title).to.equal(title2);
  });
});