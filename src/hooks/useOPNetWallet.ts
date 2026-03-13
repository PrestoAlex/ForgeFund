import { useCallback, useEffect, useState } from 'react';

interface WalletState {
  connected: boolean;
  address: string | null;
  balance: number;
}

interface OPNetProvider {
  request?: (params: { method: string; params?: any[] }) => Promise<any>;
  request_accounts?: () => Promise<string[]>;
  requestAccounts?: () => Promise<string[]>;
  get_accounts?: () => Promise<string[]>;
  getAccounts?: () => Promise<string[]>;
  get_balance?: () => Promise<any>;
  getBalance?: () => Promise<any>;
  disconnect?: () => Promise<void>;
}

declare global {
  interface Window {
    opnet?: OPNetProvider;
  }
}

const walletState: WalletState = {
  connected: false,
  address: null,
  balance: 0,
};

function getProvider(): OPNetProvider | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!window.opnet) return null;
    return window.opnet;
  } catch {
    return null;
  }
}

async function callProvider(methods: string[], params: any[] = []): Promise<any> {
  const provider = getProvider();
  if (!provider) throw new Error('OP_NET Wallet extension not detected');

  if (typeof provider.request === 'function') {
    for (const method of methods) {
      try {
        return await provider.request({ method, params });
      } catch { /* try next */ }
    }
  }

  for (const method of methods) {
    if (typeof provider[method as keyof OPNetProvider] === 'function') {
      try {
        return await (provider[method as keyof OPNetProvider] as Function)(...params);
      } catch { /* try next */ }
    }
  }

  throw new Error('No compatible OP_NET wallet API method found');
}

async function connectWallet(): Promise<WalletState> {
  const accounts = await callProvider(['request_accounts', 'requestAccounts'], []);
  if (!accounts || !accounts.length) throw new Error('No wallet accounts returned');

  walletState.connected = true;
  walletState.address = accounts[0];

  try {
    const bal = await callProvider(['get_balance', 'getBalance'], []);
    walletState.balance = Number(bal?.total ?? bal?.confirmed ?? bal ?? 0);
  } catch {
    walletState.balance = 0;
  }

  return { ...walletState };
}

async function disconnectWallet(): Promise<WalletState> {
  const provider = getProvider();
  if (provider && typeof provider.disconnect === 'function') {
    try { await provider.disconnect(); } catch { /* local cleanup */ }
  }

  walletState.connected = false;
  walletState.address = null;
  walletState.balance = 0;
  return { ...walletState };
}

async function refreshWallet(): Promise<WalletState> {
  const provider = getProvider();
  if (!provider) return { ...walletState, connected: false };

  try {
    const accounts = await callProvider(['get_accounts', 'getAccounts'], []);
    if (accounts && accounts.length) {
      walletState.connected = true;
      walletState.address = accounts[0];
      try {
        const bal = await callProvider(['get_balance', 'getBalance'], []);
        walletState.balance = Number(bal?.total ?? bal?.confirmed ?? bal ?? 0);
      } catch {
        walletState.balance = 0;
      }
    } else {
      walletState.connected = false;
      walletState.address = null;
      walletState.balance = 0;
    }
  } catch {
    walletState.connected = false;
    walletState.address = null;
    walletState.balance = 0;
  }

  return { ...walletState };
}

export function useOPNetWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    balance: 0,
  });
  const [loading, setLoading] = useState(false);

  const sync = useCallback(async () => {
    const state = await refreshWallet();
    setWallet({ connected: state.connected, address: state.address, balance: state.balance });
  }, []);

  const connect = useCallback(async () => {
    setLoading(true);
    try {
      const state = await connectWallet();
      setWallet({ connected: state.connected, address: state.address, balance: state.balance });
      return { ok: true, wallet: state };
    } catch (error: any) {
      return { ok: false, error: error.message || String(error) };
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setLoading(true);
    try {
      const state = await disconnectWallet();
      setWallet({ connected: state.connected, address: state.address, balance: state.balance });
      return { ok: true, wallet: state };
    } catch (error: any) {
      return { ok: false, error: error.message || String(error) };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { sync(); }, [sync]);

  return { wallet, loading, connect, disconnect, sync };
}
