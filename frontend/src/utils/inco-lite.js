import { getAddress, formatUnits } from "viem";
import { Lightning } from "@inco/js/lite";

export const getConfig = () => {
  // For local development, we need to use the test network configuration
  // but adapt it to work with the local Anvil chain
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID 
    ? parseInt(process.env.NEXT_PUBLIC_CHAIN_ID) 
    : 84532; // baseSepolia

  if (chainId === 31337) {
    // Using Anvil local chain
    return Lightning.latest("testnet", 31337);
  }
  // Using baseSepolia
  return Lightning.latest("testnet", 84532);
};

/**
 * @example
 * const encryptedValue = await encryptValue({
 *   value: 100,
 *   address: "0x123...",
 *   contractAddress: "0x456..."
 * });
 */
export const encryptValue = async ({ value, address, contractAddress }) => {
  // Convert the input value to BigInt for proper encryption
  const valueBigInt = BigInt(value);

  // Format the contract address to checksum format for standardization
  const checksummedAddress = getAddress(contractAddress);

  const incoConfig = await getConfig();

  const encryptedData = await incoConfig.encrypt(valueBigInt, {
    accountAddress: address,
    dappAddress: checksummedAddress,
  });

  console.log("Encrypted data:", encryptedData);

  return encryptedData;
};

/**
 * @example
 * const decryptedValue = await reEncryptValue({
 *   walletClient: yourWalletClient,
 *   handle: encryptionHandle
 * });
 */
export const reEncryptValue = async ({ walletClient, handle }) => {
  // Validate that all required parameters are provided
  if (!walletClient || !handle) {
    throw new Error("Missing required parameters for creating reencryptor");
  }

  try {
    const incoConfig = await getConfig();
    const reencryptor = await incoConfig.getReencryptor(walletClient.data);

    const decryptedResult = await reencryptor({
      handle: handle.toString(),
    });

    console.log("Decrypted result:", decryptedResult);

    // Optional formatting of the decrypted value
    const decryptedEther = formatUnits(BigInt(decryptedResult.value), 18);
    const formattedValue = parseFloat(decryptedEther).toFixed(0);

    return formattedValue;
  } catch (error) {
    throw new Error(`Failed to create reencryptor: ${error.message}`);
  }
};
