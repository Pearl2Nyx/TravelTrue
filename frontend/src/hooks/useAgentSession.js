import { useState, useCallback } from 'react';
import useWebSocket, { ReadyState } from './useWebSocket';

const useAgentSession = () => {
  const [sessionId] = useState(() => crypto.randomUUID());
  const [agentStatus, setAgentStatus] = useState('idle'); // idle | running | stopped
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [screenshot, setScreenshot] = useState(null);
  const [currentWebsite, setCurrentWebsite] = useState('');
  const [currentTask, setCurrentTask] = useState('');
  const [aiConfidence, setAiConfidence] = useState('');

  const wsUrl = `ws://localhost:8000/ws/${sessionId}`;

  const handleMessage = useCallback((event) => {
    try {
      const msg = JSON.parse(event.data);
      const { type, payload } = msg;

      switch (type) {
        case 'screenshot':
          setScreenshot(payload.data);
          break;
        case 'suggestion':
          setSuggestions((prev) => [...prev, payload.message]);
          break;
        case 'intent_change':
          setCurrentWebsite(payload.platform);
          setCurrentTask(payload.intent);
          setAiConfidence(payload.confidence);
          break;
        case 'agent_message':
          setMessages((prev) => [...prev, { role: 'agent', text: payload.message }]);
          break;
        case 'error':
          setMessages((prev) => [...prev, { role: 'agent', text: payload.message, isError: true }]);
          break;
        default:
          break;
      }
    } catch (e) {
      console.error('Failed to parse WebSocket message:', e);
    }
  }, []);

  const { sendJsonMessage, readyState } = useWebSocket(wsUrl, {
    onMessage: handleMessage,
  });

  const isConnected = readyState === ReadyState.OPEN;

  const sendMessage = useCallback(
    (type, payload) => {
      sendJsonMessage({ type, payload });
    },
    [sendJsonMessage]
  );

  const startAgent = useCallback(() => {
    sendMessage('start_agent');
    setAgentStatus('running');
  }, [sendMessage]);

  const stopAgent = useCallback(() => {
    sendMessage('stop_agent');
    setAgentStatus('stopped');
  }, [sendMessage]);

  const sendUserMessage = useCallback(
    (text) => {
      setMessages((prev) => [...prev, { role: 'user', text }]);
      sendMessage('user_message', { text });
    },
    [sendMessage]
  );

  const acceptSuggestion = useCallback(
    (suggestionType) => {
      sendMessage('accept_suggestion', { suggestion_type: suggestionType });
    },
    [sendMessage]
  );

  const dismissSuggestion = useCallback(
    (suggestionType) => {
      sendMessage('dismiss_suggestion', { suggestion_type: suggestionType });
    },
    [sendMessage]
  );

  return {
    sessionId,
    isConnected,
    agentStatus,
    messages,
    suggestions,
    screenshot,
    currentWebsite,
    currentTask,
    aiConfidence,
    startAgent,
    stopAgent,
    sendUserMessage,
    acceptSuggestion,
    dismissSuggestion,
  };
};

export default useAgentSession;
