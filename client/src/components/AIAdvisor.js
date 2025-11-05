import React, { useState, useEffect, useRef } from 'react';
import { aiAdvisorAPI } from '../services/api';
import './AIAdvisor.css';

function AIAdvisor() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
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
        const agentResponse = response.data.data.agent_response;

        console.log('Agent Response:', agentResponse);

        const assistantMessage = {
          id: messages.length + 2,
          type: 'assistant',
          content: agentResponse,
          timestamp: new Date(),
          metadata: {
            toolsUsed: agentResponse.tools_used || [],
            iterations: agentResponse.iterations || 0
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

  const renderMessageContent = (message) => {
    if (message.type === 'assistant' && message.content && typeof message.content === 'object') {
      const { summary, analysis, recommendations, tools_used } = message.content;

      // If no summary and it's a plain text response, render as text
      if (!summary && !analysis && !recommendations && typeof message.content === 'string') {
        return <p>{message.content}</p>;
      }

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

    // Handle string content or fallback
    if (typeof message.content === 'string') {
      return <p>{message.content}</p>;
    }

    // Debug: show what we received
    return (
      <div>
        <p>Received response (check console for details)</p>
        <pre style={{ fontSize: '10px', background: '#f5f5f5', padding: '8px', borderRadius: '4px', overflow: 'auto', maxHeight: '200px' }}>
          {JSON.stringify(message.content, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="ai-advisor-container">
      <div className="chat-header">
        <h2>AI Financial Advisor</h2>
        <p className="chat-subtitle">Ask me anything about your finances</p>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-avatar">
              {message.type === 'user' ? 'You' : 'AI'}
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
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant">
            <div className="message-avatar">AI</div>
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
  );
}

export default AIAdvisor;
