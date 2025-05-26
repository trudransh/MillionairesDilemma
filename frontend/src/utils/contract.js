import millionairesDilemmaABI from "@/abi/millionairesDilemma.json";
import millionairesDilemmaFactoryABI from "@/abi/millionairesDilemmaFactory.json";

// Update this with your newly deployed factory address
export const MILLIONAIRES_DILEMMA_FACTORY_ADDRESS =
  process.env.NEXT_PUBLIC_MILLIONAIRES_DILEMMA_FACTORY_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const MILLIONAIRES_DILEMMA_ABI = millionairesDilemmaABI;
export const MILLIONAIRES_DILEMMA_FACTORY_ABI = millionairesDilemmaFactoryABI;
