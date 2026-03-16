import { default as useWebSocketLib, ReadyState } from 'react-use-websocket';

/**
 * Thin wrapper around react-use-websocket with default reconnect config.
 */
const defaultOptions = {
  shouldReconnect: () => true,
  reconnectAttempts: 10,
  reconnectInterval: (attemptNumber) => Math.min(1000 * 2 ** attemptNumber, 15000),
};

const useWebSocket = (url, options = {}) => {
  return useWebSocketLib(url, { ...defaultOptions, ...options });
};

export { ReadyState };
export default useWebSocket;
