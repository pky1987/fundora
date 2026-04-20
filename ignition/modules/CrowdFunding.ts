import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CrowdFundingModule = buildModule("CrowdFundingModule", (m) => {
  const crowdfunding = m.contract("CrowdFunding");

  return { crowdfunding };
});

export default CrowdFundingModule;
