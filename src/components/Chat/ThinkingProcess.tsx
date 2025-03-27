
import React from "react";
import { Brain } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ThinkingProcessProps {
  thinking: string;
}

const ThinkingProcess: React.FC<ThinkingProcessProps> = ({ thinking }) => {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[80%] rounded-lg px-4 py-2 bg-purple-50 dark:bg-purple-950/30">
        <div className="flex items-center gap-1 mb-2 text-purple-700 dark:text-purple-300">
          <Brain className="h-4 w-4" />
          <span className="font-medium">Thinking...</span>
        </div>
        
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
          {thinking}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default ThinkingProcess;
