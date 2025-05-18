import React, { useState } from "react";
import { ChatMessage as MessageType } from "../../context/ChatContext";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import "katex/dist/katex.css";
import { InlineMath, BlockMath } from 'react-katex';

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

  // Process the content to find LaTeX expressions
  const processContent = (content: string) => {
    // Replace inline math expressions: $...$
    let processed = content.replace(/\$([^$\n]+?)\$/g, '::latex::$1::latex::');
    
    // Replace block math expressions: $$...$$
    processed = processed.replace(/\$\$([\s\S]+?)\$\$/g, '::latex-block::$1::latex-block::');
    
    return processed;
  };

  // Render markdown with LaTeX support
  const renderContent = (content: string) => {
    const processedContent = processContent(content);
    
    return (
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
          // Process special LaTeX markers in text nodes
          p: ({ children, ...props }) => {
            if (typeof children === 'string') {
              return <p {...props}>{children}</p>;
            }
            
            // Transform the children to handle LaTeX markers
            const elements = React.Children.toArray(children).map((child, index) => {
              if (typeof child !== 'string') return child;
              
              const parts = child.split(/(::latex::.*?::latex::)|(::latex-block::.*?::latex-block::)/g)
                .filter(Boolean)
                .map((part, i) => {
                  if (part.startsWith('::latex::')) {
                    const math = part.replace(/^::latex::(.*)::latex::$/, '$1');
                    return <InlineMath key={`${index}-${i}`} math={math} />;
                  } else if (part.startsWith('::latex-block::')) {
                    const math = part.replace(/^::latex-block::(.*)::latex-block::$/, '$1');
                    return <BlockMath key={`${index}-${i}`} math={math} />;
                  } else {
                    return part;
                  }
                });
              
              return parts;
            });
            
            return <p {...props}>{elements}</p>;
          },
          // Apply the same LaTeX processing to other text elements
          li: ({ children, ...props }) => {
            if (typeof children === 'string') {
              return <li {...props}>{children}</li>;
            }
            
            const elements = React.Children.toArray(children).map((child, index) => {
              if (typeof child !== 'string') return child;
              
              const parts = child.split(/(::latex::.*?::latex::)|(::latex-block::.*?::latex-block::)/g)
                .filter(Boolean)
                .map((part, i) => {
                  if (part.startsWith('::latex::')) {
                    const math = part.replace(/^::latex::(.*)::latex::$/, '$1');
                    return <InlineMath key={`${index}-${i}`} math={math} />;
                  } else if (part.startsWith('::latex-block::')) {
                    const math = part.replace(/^::latex-block::(.*)::latex-block::$/, '$1');
                    return <BlockMath key={`${index}-${i}`} math={math} />;
                  } else {
                    return part;
                  }
                });
              
              return parts;
            });
            
            return <li {...props}>{elements}</li>;
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    );
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
              {renderContent(message.content)}
            </TabsContent>
            <TabsContent value="thinking" className="mt-0">
              <div className="bg-purple-50 dark:bg-purple-950/30 p-2 rounded-md">
                {renderContent(message.thinking || "No thinking process available.")}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          renderContent(message.content)
        )}
        <div className="text-xs opacity-50 mt-1 text-right">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
