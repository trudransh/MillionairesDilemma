import { Lightning } from '@inco/js/lite';
import { anvil } from 'viem/chains';
import { describe } from 'vitest';
import { runE2ETest } from './lightning-test.ts';

describe(`Lightning Local Node E2E`, { timeout: 50_000 }, async () => {
  const zap = Lightning.localNode();
  runE2ETest(Math.floor(Math.random() * 100), zap, {
    chain: anvil,
    senderPrivKey: zap.deployment.senderPrivateKey,
    hostChainRpcUrl: 'http://127.0.0.1:8545',
  });
});
