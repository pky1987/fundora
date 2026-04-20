# 📚 Project Deep-Dive: A Next.js & Web3 Beginner's Guide

Welcome! This guide explains how **Fundora** works, the purpose of each module, and how the frontend talks to the blockchain.

---

## 🛠 Project Components

### 1. Smart Contract (`contracts/CrowdFunding.sol`)
The "brain" of our platform. It stores all campaign data (title, goal, amount raised) directly on the blockchain. It ensures that when you donate, the funds go directly to the campaign owner's wallet automatically.

### 2. Next.js (`client/app/`)
Next.js is the React framework we use for the frontend. We use the **App Router** (the `app` folder), which is the modern way to build Next.js apps.

- **`app/layout.tsx`**: The "master template." It contains the header and wraps the whole app in a `Providers` component.
- **`app/page.tsx`**: The main screen. It handles both displaying campaigns and the "Launch Campaign" form.
- **`app/globals.css`**: The styling file using **Tailwind CSS 4**.

---

## 🔌 Modules & Libraries

### **Wagmi** (`wagmi`)
Think of Wagmi as the **"Bridge"** between React and your Crypto Wallet (MetaMask).
- **Why use it?** It provides easy-to-use "Hooks" like `useAccount()` (to see who is logged in) and `useReadContract()` (to get data from the blockchain).

### **Viem** (`viem`)
Viem is the **"Engine"** that handles the low-level blockchain communication. Wagmi uses it under the hood. 
- **Why use it?** It's fast, lightweight, and helps us format numbers (e.g., converting "0.1 ETH" to the tiny units the blockchain understands, called "Wei").

### **Hardhat & Ignition**
- **Hardhat**: The environment for compiling and testing smart contracts.
- **Ignition**: The new deployment system that keeps track of where your contract is deployed so you don't lose the address.

---

## 🔄 How the Data Flows

1. **Deploying**: When you run `npm run deploy`, the script compiles your contract and tells the blockchain to create it.
2. **Updating**: The script then creates `client/constants/contract.ts`. This file contains the **ABI** (the list of functions inside your contract) and the **Address** (where it lives on the blockchain).
3. **Reading**: In `client/app/page.tsx`, we use `useReadContract()` from Wagmi. It looks at the **Address** and **ABI**, talks to the blockchain, and brings the data into your browser.
4. **Writing**: When you click "Donate", we use `writeContract()`. This opens MetaMask, asks for your confirmation (and payment), and sends the transaction to the network.

---

## 🧭 Navigating the Code

- **Adding a new feature?** Start in `contracts/CrowdFunding.sol`.
- **Changing the look?** Edit `client/app/page.tsx` and `client/app/globals.css`.
- **Connecting a new wallet?** Look at `client/config/index.ts`.

---

## 🚀 Pro-Tip for Beginners
- Contracts are **immutable**. Once deployed, you cannot change the code. If you find a bug, you must fix it and **re-deploy** to a new address.
- Every "write" action (creating/donating) costs "Gas" (transaction fees), while "read" actions are free!
