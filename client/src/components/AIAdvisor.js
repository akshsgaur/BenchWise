import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { aiAdvisorAPI } from '../services/api';
import './AIAdvisor.css';

function AIAdvisor() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history and set initial welcome message
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const response = await aiAdvisorAPI.getChatHistory();
        if (response.data.success && response.data.data.history.length > 0) {
          // Convert database messages to component format
          const historyMessages = response.data.data.history.map(msg => ({
            id: msg.id,
            type: msg.type,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            metadata: msg.metadata || {}
          }));
          setMessages(historyMessages);
        } else {
          // No history - show welcome message
          setMessages([{
            id: 1,
            type: 'assistant',
            content: "Hi! I'm your AI Financial Advisor. I can help you understand your spending, subscriptions, savings rate, debt-to-income ratio, and financial goals. What would you like to know about your finances?",
            timestamp: new Date(),
            suggestedQuestions: [
              "How much am I spending on subscriptions?",
              "What's my debt-to-income ratio?",
              "Can I save $10,000 in a year?",
              "What are my biggest spending categories?",
              "Show me my recurring charges"
            ]
          }]);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        // Show welcome message on error
        setMessages([{
          id: 1,
          type: 'assistant',
          content: "Hi! I'm your AI Financial Advisor. I can help you understand your spending, subscriptions, savings rate, debt-to-income ratio, and financial goals. What would you like to know about your finances?",
          timestamp: new Date(),
          suggestedQuestions: [
            "How much am I spending on subscriptions?",
            "What's my debt-to-income ratio?",
            "Can I save $10,000 in a year?",
            "What are my biggest spending categories?",
            "Show me my recurring charges"
          ]
        }]);
      }
    };

    loadChatHistory();
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      const response = await aiAdvisorAPI.askQuestion(inputMessage);

      console.log('AI Advisor Response:', response.data);

      if (response.data.success) {
        const responseData = response.data.data;
        const agentResponse = responseData.agent_response;
        const responseType = responseData.response_type || (typeof agentResponse === 'object' ? 'structured' : 'plain');

        console.log('Agent Response:', agentResponse);
        console.log('Response Type:', responseType);

        const assistantMessage = {
          id: messages.length + 2,
          type: 'assistant',
          content: agentResponse,
          timestamp: new Date(),
          metadata: {
            toolsUsed: responseData.tools_used || [],
            iterations: agentResponse?.iterations || 0,
            responseType: responseType
          }
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.data.message || 'Failed to get response');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.message || 'Failed to get AI response. Please try again.');

      // Add error message to chat
      const errorMessage = {
        id: messages.length + 2,
        type: 'error',
        content: 'Sorry, I encountered an error. Please try again or rephrase your question.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
  };

  const handleClearChat = async () => {
    // Show confirmation modal
    setShowClearConfirm(true);
  };

  const confirmClearChat = async () => {
    setShowClearConfirm(false);
    
    try {
      setIsLoading(true);
      const response = await aiAdvisorAPI.deleteAllMessages();
      
      if (response.data.success) {
        // Reset to welcome message
        setMessages([{
          id: 1,
          type: 'assistant',
          content: "Hi! I'm your AI Financial Advisor. I can help you understand your spending, subscriptions, savings rate, debt-to-income ratio, and financial goals. What would you like to know about your finances?",
          timestamp: new Date(),
          suggestedQuestions: [
            "How much am I spending on subscriptions?",
            "What's my debt-to-income ratio?",
            "Can I save $10,000 in a year?",
            "What are my biggest spending categories?",
            "Show me my recurring charges"
          ]
        }]);
        setError('');
      } else {
        throw new Error(response.data.message || 'Failed to clear chat');
      }
    } catch (err) {
      console.error('Error clearing chat:', err);
      setError(err.response?.data?.message || 'Failed to clear chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelClearChat = () => {
    setShowClearConfirm(false);
  };

  const renderMessageContent = (message) => {
    // Check if this is a structured response (has response_type metadata or is an object with specific keys)
    const isStructured = message.metadata?.responseType === 'structured' || 
                         (message.type === 'assistant' && 
                          message.content && 
                          typeof message.content === 'object' && 
                          (message.content.summary || message.content.analysis || message.content.recommendations));

    // If it's a plain text response (string or not structured), render as simple text
    if (!isStructured && typeof message.content === 'string') {
      return <p>{message.content}</p>;
    }

    // Handle structured responses
    if (isStructured && message.content && typeof message.content === 'object') {
      const { summary, analysis, recommendations, tools_used } = message.content;

      return (
        <div className="agent-response">
          {summary && (
            <div className="response-section">
              <h4>Summary</h4>
              <p>{summary}</p>
            </div>
          )}

          {analysis && (
            <div className="response-section">
              <h4>Analysis</h4>

              {analysis.key_metrics && analysis.key_metrics.length > 0 && (
                <div className="metrics-grid">
                  {analysis.key_metrics.map((metric, idx) => (
                    <div key={idx} className="metric-card">
                      <div className="metric-label">{metric.metric}</div>
                      <div className="metric-value">{metric.value}</div>
                      <div className={`metric-assessment ${metric.assessment.toLowerCase().replace(' ', '-')}`}>
                        {metric.assessment}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {analysis.insights && analysis.insights.length > 0 && (
                <div className="insights-list">
                  <strong>Key Insights:</strong>
                  <ul>
                    {analysis.insights.map((insight, idx) => (
                      <li key={idx}>{insight}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {recommendations && recommendations.length > 0 && (
            <div className="response-section">
              <h4>Recommendations</h4>
              <div className="recommendations-list">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className={`recommendation priority-${rec.priority}`}>
                    <div className="rec-header">
                      <span className="rec-priority">{rec.priority} priority</span>
                    </div>
                    <div className="rec-action">{rec.action}</div>
                    <div className="rec-impact">{rec.expected_impact}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tools_used && tools_used.length > 0 && (
            <div className="tools-used">
              <small>Tools used: {tools_used.join(', ')}</small>
            </div>
          )}
        </div>
      );
    }

    // Fallback: render as plain text if content exists
    if (message.content) {
      if (typeof message.content === 'string') {
        return <p>{message.content}</p>;
      }
      // If it's an object but not structured, try to extract text
      if (typeof message.content === 'object' && message.content.summary) {
        return <p>{message.content.summary}</p>;
      }
    }

    // Last resort: show error message
    return <p>Unable to display message content.</p>;
  };

  return (
    <>
      {/* Confirmation Modal - Rendered via Portal to avoid clipping */}
      {showClearConfirm && createPortal(
        <div className="confirm-modal-overlay" onClick={cancelClearChat}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <div className="confirm-modal-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </div>
              <h3>Clear Chat History?</h3>
            </div>
            <div className="confirm-modal-body">
              <p>Are you sure you want to clear all chat messages? This action cannot be undone.</p>
            </div>
            <div className="confirm-modal-footer">
              <button
                className="confirm-modal-btn cancel-btn"
                onClick={cancelClearChat}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="confirm-modal-btn confirm-btn"
                onClick={confirmClearChat}
                disabled={isLoading}
              >
                {isLoading ? 'Clearing...' : 'Clear Chat'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div className="ai-advisor-container">
        <div className="chat-header-content">
          <div>
            <h2>AI Financial Advisor</h2>
            <p className="chat-subtitle">Ask me anything about your finances</p>
          </div>
          {messages.length > 1 && (
            <button
              className="clear-chat-button"
              onClick={handleClearChat}
              disabled={isLoading}
              title="Clear chat history"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Clear Chat
            </button>
          )}
        </div>

        <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-avatar">
              {message.type === 'user' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              )}
            </div>
            <div className="message-content">
              {renderMessageContent(message)}

              {message.suggestedQuestions && (
                <div className="suggested-questions">
                  <p><strong>Try asking:</strong></p>
                  <div className="question-chips">
                    {message.suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        className="question-chip"
                        onClick={() => handleSuggestedQuestion(q)}
                        disabled={isLoading}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <span className="message-time">
                {message.timestamp instanceof Date 
                  ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant">
            <div className="message-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p className="analyzing-text">Analyzing your financial data...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="chat-error">
          {error}
        </div>
      )}

      <div className="chat-input-container">
        <textarea
          className="chat-input"
          placeholder="Ask about your spending, savings, subscriptions, or financial goals..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          rows={1}
        />
        <button
          className="send-button"
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </div>
    </div>
    </>
  );
}

export default AIAdvisor;
