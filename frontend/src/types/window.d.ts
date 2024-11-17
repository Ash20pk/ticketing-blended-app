interface Window {
  ethereum?: {
    request: (params: { method: string; params?: any[] }) => Promise<any>;
    isMetaMask?: boolean;
  }
}