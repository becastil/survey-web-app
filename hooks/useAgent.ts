import { useState } from 'react';

export function useAgent() {
  const [agent, setAgent] = useState(null);
  
  return {
    agent,
    setAgent,
    isReady: false
  };
}