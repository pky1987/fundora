import crypto from "crypto";
import dotenv from "dotenv";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

dotenv.config();

const encryptedKey = process.env.PRIVATE_KEY;
const password = process.env.ENCRYPTION_PASSWORD;

if (!password) {
  console.error("❌ Error: ENCRYPTION_PASSWORD environment variable is missing.");
  process.exit(1);
}

/**
 * Modern PBKDF2 key/IV derivation
 */
function deriveKeyIv(password, salt, keyLen, ivLen) {
  // Matches OpenSSL -pbkdf2 -iter 10000 -md sha256
  const keyIv = crypto.pbkdf2Sync(password, salt, 10000, keyLen + ivLen, "sha256");
  return {
    key: keyIv.slice(0, keyLen),
    iv: keyIv.slice(keyLen, keyLen + ivLen)
  };
}

// 1. Decrypt Private Key
if (!encryptedKey) {
  console.error("Error: PRIVATE_KEY environment variable is missing.");
  process.exit(1);
}

let privateKey;
try {
  const data = Buffer.from(encryptedKey, "base64");
  const salt = data.slice(8, 16);
  const ciphertext = data.slice(16);

  const { key, iv } = deriveKeyIv(password, salt, 32, 16);
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

  let decrypted = decipher.update(ciphertext, "binary", "utf8");
  decrypted += decipher.final("utf8");

  privateKey = decrypted.trim();

  if (privateKey.length < 60) {
    console.error("❌ Error: The decrypted value looks like an Address, not a Private Key.");
    console.log("A private key should be 64 characters long (66 with 0x).");
    console.log("Decrypted value starts with:", privateKey.substring(0, 10) + "...");
    process.exit(1);
  }

  console.log("✅ Decrypted Private Key Successfully.");
} catch (error) {
  console.error("❌ Decryption failed:", error.message);
  process.exit(1);
}

// 2. Check for RPC URL if deploying to a remote network
const network = process.env.HARDHAT_NETWORK || "localhost";

if (network === "sepolia" && (!process.env.SEPOLIA_RPC_URL || process.env.SEPOLIA_RPC_URL.includes("YOUR_API_KEY"))) {
  console.error("❌ Error: SEPOLIA_RPC_URL is missing or contains a placeholder in your .env file.");
  console.log("Please add: SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_key");
  process.exit(1);
}

// 3. Compile Contracts (Provide Artifacts and Cache)
console.log("📦 Compiling contracts...");
execSync("npx hardhat compile", { stdio: "inherit" });

// 4. Deploy
console.log(`🚀 Deploying to ${network}...`);

try {
  process.env.PRIVATE_KEY_DECRYPTED = privateKey;
  // Note: We used to include --yes, but it's not supported by this version of Ignition
  execSync(`npx hardhat ignition deploy ignition/modules/CrowdFunding.ts --network ${network}`, {
    stdio: "inherit",
    env: { ...process.env, PRIVATE_KEY_DECRYPTED: privateKey }
  });

  // 4. Update Frontend Constants
  console.log("📂 Updating frontend constants...");

  // Find deployment info
  // Ignition stores addresses in ignition/deployments/chain-<id>/deployed_addresses.json
  // For localhost, chain ID is usually 31337
  const chainId = network === "localhost" ? "31337" : (network === "sepolia" ? "11155111" : "80002");
  const deploymentPath = path.join(process.cwd(), "ignition", "deployments", `chain-${chainId}`, "deployed_addresses.json");

  if (fs.existsSync(deploymentPath)) {
    const addresses = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    const contractAddress = addresses["CrowdFundingModule#CrowdFunding"];

    // Copy ABI from artifacts
    const artifactPath = path.join(process.cwd(), "artifacts", "contracts", "CrowdFunding.sol", "CrowdFunding.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const constantsDir = path.join(process.cwd(), "client", "constants");
    if (!fs.existsSync(constantsDir)) fs.mkdirSync(constantsDir, { recursive: true });

    const constantsContent = `export const contractAddress = "${contractAddress}";\nexport const abi = ${JSON.stringify(artifact.abi, null, 2)};\n`;
    fs.writeFileSync(path.join(constantsDir, "contract.ts"), constantsContent);
    console.log(`✅ Frontend updated with address: ${contractAddress}`);
  }

  // 5. Open Page
  console.log("🌐 Opening crowdfunding page...");
  // Start the frontend in the background if it's not running
  // For Windows, 'start' command works.
  const url = "http://localhost:3000";

  // Instructions for the user
  console.log("\n--------------------------------------------------");
  console.log(`1. Make sure your local node is running (npx hardhat node)`);
  console.log(`2. The frontend constants have been updated.`);
  console.log(`3. Start the frontend: cd client && npm run dev`);
  console.log(`4. Open ${url} in your browser with MetaMask connected.`);
  console.log("--------------------------------------------------\n");

  // Attempting to open the browser (will fail if not in a desktop env, but good gesture)
  try {
    const explorerCommand = process.platform === 'win32' ? 'start' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
    // We don't wait for the browser to close
    // execSync(`${explorerCommand} ${url}`); 
  } catch (e) {
    // Ignore browser open errors
  }

} catch (deployError) {
  console.error("❌ Deployment failed. If using localhost, make sure 'npx hardhat node' is running in another terminal.");
  // process.exit(1);
}