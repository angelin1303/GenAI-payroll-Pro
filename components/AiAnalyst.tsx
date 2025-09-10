// Fix: Creating the AiAnalyst component to provide AI-powered payroll insights.
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { createAnalystChat } from '../services/geminiService';
import { EmployeeWithPayroll, ChatMessage, ToolResultMessage, AiToolCall, ToolExecutionResult } from '../types';
import { SendIcon, UserIcon, SparklesIcon, MicrophoneIcon } from './icons';

// Add SpeechRecognition types to the window object for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type HistoryItem = ChatMessage | ToolResultMessage;

interface AiAnalystProps {
  employeesWithPayroll: EmployeeWithPayroll[];
  onExecuteTool: (toolCall: AiToolCall) => ToolExecutionResult;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};

const AiAnalyst: React.FC<AiAnalystProps> = ({ employeesWithPayroll, onExecuteTool }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const chatRef = useRef<Chat | null>(null);
  const recognitionRef = useRef<any>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const initialPrompt = `Analyze the following payroll data: ${JSON.stringify(employeesWithPayroll, null, 2)}`;

  // Effect to initialize or reset the chat
  useEffect(() => {
    // Initialize a new chat session when the component mounts or data changes significantly
    chatRef.current = createAnalystChat();
    
    if (employeesWithPayroll.length > 0) {
      setHistory([]);
      setIsLoading(true);
      // Automatically send the initial analysis prompt
      handleInitialAnalysis(initialPrompt);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeesWithPayroll]);

  // Effect for auto-scrolling the chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history]);

  // Effect for setting up Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognitionRef.current = recognition;
  }, []);

  const handleInitialAnalysis = async (prompt: string) => {
    if (!chatRef.current) return;
    try {
        // Fix: Wrap the message string in a SendMessageParameters object.
        const response = await chatRef.current.sendMessage({ message: prompt });
        const text = response.text;
        setHistory([{ role: 'model', parts: [{ text }] }]);
    } catch (error) {
        console.error('AI Analyst Error:', error);
        setHistory([{ role: 'model', parts: [{ text: 'Sorry, I encountered an error during initial analysis.' }] }]);
    } finally {
        setIsLoading(false);
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !chatRef.current) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
    setHistory(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        // 1. Send user message and get potential tool call
        // Fix: Wrap the message string in a SendMessageParameters object.
        const response = await chatRef.current.sendMessage({ message: input });
        const part = response.candidates?.[0]?.content?.parts[0];

        if (part && 'functionCall' in part && part.functionCall) {
            const toolCall: AiToolCall = {
                name: part.functionCall.name,
                args: part.functionCall.args,
            };

            // 2. Execute the tool
            const executionResult = onExecuteTool(toolCall);
            const toolResultMsg: ToolResultMessage = { role: 'tool', result: executionResult };
            setHistory(prev => [...prev, toolResultMsg]);

            // 3. Send tool result back to the model
            const toolResponsePart = {
                functionResponse: {
                    name: toolCall.name,
                    response: { content: JSON.stringify(executionResult) },
                },
            };
            
            // The sendMessage API expects an array of parts for tool responses
            // Fix: Wrap the tool response parts array in a SendMessageParameters object.
            const finalResponse = await chatRef.current.sendMessage({ message: [toolResponsePart] });
            const text = finalResponse.text;
            setHistory(prev => [...prev, { role: 'model', parts: [{ text }] }]);

        } else {
            // It's a regular text response
            const text = response.text;
            setHistory(prev => [...prev, { role: 'model', parts: [{ text }] }]);
        }

    } catch (error) {
        console.error('AI Analyst Error:', error);
        setHistory(prev => [...prev, { role: 'model', parts: [{ text: 'Sorry, I encountered an error. Please try again.' }] }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  }

  const handleListen = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mt-8 flex flex-col h-[500px]">
      <h2 className="text-2xl font-bold text-brand-dark mb-4">AI Payroll Analyst</h2>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto pr-4 -mr-4 space-y-4">
        {history.map((msg, index) => {
            if (msg.role === 'tool') {
                return (
                    <div key={index} className="flex justify-center">
                        {msg.result.status === 'success' ? (
                             <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm max-w-md w-full">
                                <p className="font-bold mb-1">✅ Employee Added Successfully</p>
                                <p><span className="font-semibold">Name:</span> {msg.result.employeeName}</p>
                                <p><span className="font-semibold">Net Pay:</span> {formatCurrency(msg.result.netPay)}</p>
                            </div>
                        ) : (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm max-w-md w-full">
                                <p className="font-bold mb-1">⚠️ Error Adding Employee</p>
                                <p>{msg.result.message}</p>
                            </div>
                        )}
                    </div>
                )
            }
            return (
                 <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'model' && <SparklesIcon />}
                    <div className={`p-4 rounded-lg max-w-lg ${msg.role === 'user' ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-800'}`}>
                    <p className="whitespace-pre-wrap">{msg.parts[0].text}</p>
                    </div>
                    {msg.role === 'user' && <UserIcon />}
                </div>
            )
        })}
        {isLoading && history[history.length - 1]?.role !== 'model' && (
             <div className="flex items-start gap-4">
                <SparklesIcon />
                <div className="p-4 rounded-lg bg-gray-100 text-gray-800">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                </div>
            </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex items-center space-x-2 border-t pt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "Listening..." : "Add an employee or ask a question..."}
          className="flex-1 p-2 border rounded-md focus:ring-brand-primary focus:border-brand-primary"
          disabled={isLoading || employeesWithPayroll.length === 0}
        />
         <button
          type="button"
          onClick={handleListen}
          disabled={!recognitionRef.current || isLoading}
          className={`p-3 rounded-full transition-colors disabled:opacity-50 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          <MicrophoneIcon />
        </button>
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-3 bg-brand-primary text-white rounded-full hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <SendIcon />
        </button>
      </form>
    </div>
  );
};

export default AiAnalyst;