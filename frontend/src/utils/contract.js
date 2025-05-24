
import millionairesDilemmaABI from "@/abi/millionairesDilemma.json";
import millionairesDilemmaFactoryABI from "@/abi/millionairesDilemmaFactory.json";

// Add your Millionaire's Dilemma contracts
export const MILLIONAIRES_DILEMMA_FACTORY_ADDRESS =
  process.env.NEXT_PUBLIC_MILLIONAIRES_DILEMMA_FACTORY_ADDRESS || "0xa15bb66138824a1c7167f5e85b957d04dd34e468";

export const MILLIONAIRES_DILEMMA_ABI = millionairesDilemmaABI;
export const MILLIONAIRES_DILEMMA_FACTORY_ABI = millionairesDilemmaFactoryABI;

