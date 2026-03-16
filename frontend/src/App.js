import { useState } from 'react';
import useAgentSession from './hooks/useAgentSession';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import TravelInput from './components/TravelInput';
import SuggestionsPanel from './components/SuggestionsPanel';
import BrowserView from './components/BrowserView';
import StatusBar from './components/StatusBar';

const responsiveStyles = `
  * { box-sizing: border-box; }

  body { margin: 0; background: #0A0A0A; }

  .app-root {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: radial-gradient(circle at top, #0F1C2E, #0A0A0A);
    color: #FFFFFF;
    font-family: sans-serif;
    overflow: hidden;
  }

  .app-body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .app-sidebar {
    width: 220px;
    min-width: 220px;
    flex-shrink: 0;
    overflow-y: auto;
    background: rgba(15,28,46,0.75);
    backdrop-filter: blur(16px);
    border-right: 1px solid rgba(245,166,35,0.15);
  }

  .app-center {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
    background: transparent;
  }

  .app-chat {
    flex: 1;
    overflow: hidden;
    min-height: 0;
  }

  .app-suggestions {
    height: 160px;
    flex-shrink: 0;
    overflow: hidden;
    border-top: 1px solid rgba(245,166,35,0.15);
    padding: 10px 12px;
    background: rgba(15,28,46,0.45);
    backdrop-filter: blur(10px);
  }

  .app-browser {
    width: 55%;
    flex-shrink: 0;
    overflow: hidden;
    padding: 16px;
    background: transparent;
  }

  @media (max-width: 768px) {
    .app-body { flex-direction: column; overflow-y: auto; }
    .app-sidebar { display: none; }
    .app-center { flex: none; height: auto; }
    .app-chat { flex: none; height: 300px; }
    .app-suggestions { height: 160px; }
    .app-browser { width: 100%; height: 300px; padding: 8px; order: -1; }
  }
`;

function App() {
  const {
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
  } = useAgentSession();

  const [selectedMode, setSelectedMode] = useState('all');
  const [selectedFilters, setSelectedFilters] = useState([]);

  return (
    <>
      <style>{responsiveStyles}</style>
      <div className="app-root">
        <Header
          agentStatus={agentStatus}
          isConnected={isConnected}
          onStart={startAgent}
          onStop={stopAgent}
        />

        <div className="app-body">
          <div className="app-sidebar">
            <Sidebar
              selectedMode={selectedMode}
              onModeChange={setSelectedMode}
              selectedFilters={selectedFilters}
              onFilterChange={setSelectedFilters}
            />
          </div>

          <div className="app-center">
            <div className="app-chat">
              <ChatPanel messages={messages} />
            </div>

            <div className="app-suggestions">
              <SuggestionsPanel
                suggestions={suggestions}
                onAccept={acceptSuggestion}
                onDismiss={dismissSuggestion}
              />
            </div>

            <TravelInput
              onSend={sendUserMessage}
              disabled={false}
            />
          </div>

          <div className="app-browser">
            <BrowserView
              screenshot={screenshot}
              currentWebsite={currentWebsite}
              currentTask={currentTask}
              isConnected={isConnected}
            />
          </div>
        </div>

        <StatusBar
          agentStatus={agentStatus}
          currentWebsite={currentWebsite}
          currentTask={currentTask}
          aiConfidence={aiConfidence}
          isConnected={isConnected}
        />
      </div>
    </>
  );
}

export default App;
