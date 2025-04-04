// src/App.tsx
import { useState } from "react";
import axios from "axios";
import _ from "lodash";
import "./App.css";

/**
 * Parses a streamed response chunk.
 * Splits the response text by newline, filters for lines starting with "data:",
 * then parses each JSON chunk and aggregates the delta content.
 */
const parseStreamResponse = ({ response }: { response: string }): string => {
  const lines = response
    .split("\n")
    .filter((line) => line.trim().startsWith("data:"));
  let aggregated = "";
  lines.forEach((line) => {
    const jsonStr = line.replace(/^data:\s*/, "").trim();
    if (jsonStr === "[DONE]") return;
    try {
      const parsed = JSON.parse(jsonStr);
      // Extract delta content (if available)
      const chunk = _.get(parsed, "choices[0].delta.content", "");
      aggregated += chunk;
    } catch (err) {
      console.error("Error parsing streamed chunk:", err);
    }
  });
  return aggregated;
};

interface ChatMessage {
  prompt: string;
  response: string;
}

const App = () => {
  // State for the input field and chat messages
  const [inputValue, setInputValue] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Update the input value as the user types
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value);
  };

  // Handle sending the user input and streaming the response
  const handleSend = async () => {
    if (inputValue.trim() === "") return;

    // Create a prompt message using a template literal
    const chatPrompt = `You: ${inputValue}`;
    // Add a new chat message with an empty response (to be updated with stream data)
    setChatMessages((prev) => [...prev, { prompt: chatPrompt, response: "" }]);

    // Prepare the API payload
    const data = {
      messages: [{ role: "user", content: inputValue }],
      model: "llama3-8b-8192",
      stream: true,
    };

    // Track the length of the response text already processed
    let lastResponseLength = 0;

    try {
      await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        data, // Sending the payload directly
        {
          responseType: "text",
          headers: {
            Authorization: `Bearer <Please enter yout API key here>`,
            "Content-Type": "application/json",
          },
          onDownloadProgress: ({ event } = {}) => {
            try {
              // Extract full text from the event's currentTarget
              const xhr = _.get(event, "currentTarget");
              if (!xhr || typeof xhr.responseText !== "string") return;
              const fullText = xhr.responseText;

              // Determine the new text that hasn't been processed yet
              const newText = fullText.slice(lastResponseLength);
              lastResponseLength = fullText.length;
              const parsedChunk = parseStreamResponse({ response: newText });

              // Update the last chat message with the new streamed chunk
              setChatMessages((prevMessages) => {
                const messages = [...prevMessages];
                const lastIndex = messages.length - 1;
                messages[lastIndex] = {
                  ...messages[lastIndex],
                  response: messages[lastIndex].response + parsedChunk,
                };
                return messages;
              });
            } catch (e) {
              console.error(e);
            }
          },
        }
      );
    } catch (e) {
      console.error(
        "Error fetching chat completion:",
        _.get(e, "response.data") || e.message
      );

      // Update the last chat message with an error message
      setChatMessages((prevMessages) => {
        const messages = [...prevMessages];
        const lastIndex = messages.length - 1;
        messages[lastIndex] = {
          ...messages[lastIndex],
          response: "Error fetching chat completion",
        };
        return messages;
      });
    } finally {
      setInputValue("");
    }
  };

  // Allow sending the message on Enter (without Shift)
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat title */}
      <h1 style={{ color: "white" }}>ChatBot</h1>
      {/* Chat container displaying messages */}
      <div className="chat-container">
        {chatMessages.map((message, index) => (
          <div key={index} className="chat-message">
            <div className="chat-prompt">{message.prompt}</div>
            <div className="chat-response">{message.response}</div>
          </div>
        ))}
      </div>
      {/* Input area with textarea and send button */}
      <div className="searchBar-container">
        <textarea
          className="search-input"
          placeholder="Enter your text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <button type="submit" onClick={handleSend}>
          send
        </button>
      </div>
    </>
  );
};

export default App;
