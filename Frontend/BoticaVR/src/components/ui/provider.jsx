// ============================================================
// Chakra UI provider for BoticaVR
// ============================================================

import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';

const system = createSystem(defaultConfig, {
  preflight: false,
});

export function Provider({ children }) {
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}
