
import React, { useState } from "react";
import { ChatMessage as MessageType } from "../../context/ChatContext";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain } from "lucide-react";

interface ChatMessageProps {
  message: MessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === "user";
  const [activeTab, setActiveTab] = useState<string>("message");

  // Only show tabs for AI messages that have thinking content
  const showTabs = !isUser && message.thinking;

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } mb-4`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {showTabs ? (
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-2">
              <TabsTrigger value="message">Message</TabsTrigger>
              <TabsTrigger value="thinking" className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                Thinking
              </TabsTrigger>
            </TabsList>
            <TabsContent value="message" className="mt-0">
              <ReactMarkdown
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !className?.includes('inline') && match ? (
                      <SyntaxHighlighter
                        language={match[1]}
                        style={vscDarkPlus}
                        PreTag="div"
                        className="rounded-md my-2"
                        customStyle={{ borderRadius: '0.375rem' }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code
                        className={`${className} bg-black/10 dark:bg-white/10 rounded-md px-1`}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </TabsContent>
            <TabsContent value="thinking" className="mt-0">
              <div className="bg-purple-50 dark:bg-purple-950/30 p-2 rounded-md">
                <ReactMarkdown
                  components={{
                    code({ node, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !className?.includes('inline') && match ? (
                        <SyntaxHighlighter
                          language={match[1]}
                          style={vscDarkPlus}
                          PreTag="div"
                          className="rounded-md my-2"
                          customStyle={{ borderRadius: '0.375rem' }}
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code
                          className={`${className} bg-black/10 dark:bg-white/10 rounded-md px-1`}
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {message.thinking || "No thinking process available."}
                </ReactMarkdown>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <ReactMarkdown
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return !className?.includes('inline') && match ? (
                  <SyntaxHighlighter
                    language={match[1]}
                    style={vscDarkPlus}
                    PreTag="div"
                    className="rounded-md my-2"
                    customStyle={{ borderRadius: '0.375rem' }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code
                    className={`${className} bg-black/10 dark:bg-white/10 rounded-md px-1`}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
        <div className="text-xs opacity-50 mt-1 text-right">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
