
import React, { useState } from "react";
import { ChatMessage as MessageType } from "../../context/ChatContext";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ChatMessageProps {
  message: MessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === "user";
  const [activeTab, setActiveTab] = useState<string>("message");
  const [copied, setCopied] = useState(false);

  // Only show tabs for AI messages that have thinking content
  const showTabs = !isUser && message.thinking;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        toast({
          title: "Copied to clipboard",
          description: "Message content copied to clipboard",
        });
        
        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      })
      .catch(err => {
        console.error("Failed to copy text: ", err);
        toast({
          title: "Copy failed",
          description: "Failed to copy text to clipboard",
          variant: "destructive",
        });
      });
  };

  // Copy code block content
  const copyCodeBlock = (code: string) => {
    copyToClipboard(code);
  };

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } mb-4 group`}
    >
      <div
        className={`relative max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {/* Copy button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => copyToClipboard(message.content)}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </Button>

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
                    const codeContent = String(children).replace(/\n$/, "");
                    
                    return !className?.includes('inline') && match ? (
                      <div className="relative group/code">
                        <SyntaxHighlighter
                          language={match[1]}
                          style={vscDarkPlus}
                          PreTag="div"
                          className="rounded-md my-2"
                          customStyle={{ borderRadius: '0.375rem' }}
                          {...props}
                        >
                          {codeContent}
                        </SyntaxHighlighter>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover/code:opacity-100 transition-opacity bg-background/50"
                          onClick={() => copyCodeBlock(codeContent)}
                        >
                          <Copy size={12} />
                        </Button>
                      </div>
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
                      const codeContent = String(children).replace(/\n$/, "");
                      
                      return !className?.includes('inline') && match ? (
                        <div className="relative group/code">
                          <SyntaxHighlighter
                            language={match[1]}
                            style={vscDarkPlus}
                            PreTag="div"
                            className="rounded-md my-2"
                            customStyle={{ borderRadius: '0.375rem' }}
                            {...props}
                          >
                            {codeContent}
                          </SyntaxHighlighter>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover/code:opacity-100 transition-opacity bg-background/50"
                            onClick={() => copyCodeBlock(codeContent)}
                          >
                            <Copy size={12} />
                          </Button>
                        </div>
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
                const codeContent = String(children).replace(/\n$/, "");
                
                return !className?.includes('inline') && match ? (
                  <div className="relative group/code">
                    <SyntaxHighlighter
                      language={match[1]}
                      style={vscDarkPlus}
                      PreTag="div"
                      className="rounded-md my-2"
                      customStyle={{ borderRadius: '0.375rem' }}
                      {...props}
                    >
                      {codeContent}
                    </SyntaxHighlighter>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover/code:opacity-100 transition-opacity bg-background/50"
                      onClick={() => copyCodeBlock(codeContent)}
                    >
                      <Copy size={12} />
                    </Button>
                  </div>
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
