import React, { useState } from "react";
import { Brain, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.css";
import { InlineMath, BlockMath } from 'react-katex';

interface ThinkingProcessProps {
  thinking: string;
}

const ThinkingProcess: React.FC<ThinkingProcessProps> = ({ thinking }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Process the content to find LaTeX expressions
  const processContent = (content: string) => {
    // Replace inline math expressions: $...$
    let processed = content.replace(/\$([^$\n]+?)\$/g, '::latex::$1::latex::');
    
    // Replace block math expressions: $$...$$
    processed = processed.replace(/\$\$([\s\S]+?)\$\$/g, '::latex-block::$1::latex-block::');
    
    return processed;
  };

  return (
    <div className="flex justify-start mb-4 w-full">
      <div className="w-full max-w-[95%] rounded-lg overflow-hidden bg-gray-900 text-white border border-gray-700">
        {/* Header section */}
        <div 
          className="flex items-center justify-between p-3 cursor-pointer"
          onClick={toggleExpanded}
        >
          <div className="flex items-center gap-2">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            <span className="font-medium">Thoughts</span>
            <span className="text-xs text-gray-400">*The thoughts produced by the model are experimental</span>
          </div>
          <Brain size={18} />
        </div>
        
        {/* Content section */}
        {isExpanded && (
          <div className="p-4 border-t border-gray-700">
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
                p: ({ children, ...props }) => {
                  if (typeof children === 'string') {
                    return <p className="my-2" {...props}>{children}</p>;
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
                  
                  return <p className="my-2" {...props}>{elements}</p>;
                },
                ol: ({ ...props }) => (
                  <ol className="list-decimal pl-6 space-y-3 my-3" {...props} />
                ),
                ul: ({ ...props }) => (
                  <ul className="list-disc pl-6 space-y-2" {...props} />
                ),
                li: ({ children, ...props }) => {
                  if (typeof children === 'string') {
                    return <li className="pl-2" {...props}>{children}</li>;
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
                  
                  return <li className="pl-2" {...props}>{elements}</li>;
                },
                h1: ({ ...props }) => (
                  <h1 className="text-xl font-bold my-3" {...props} />
                ),
                h2: ({ ...props }) => (
                  <h2 className="text-lg font-bold my-3" {...props} />
                ),
                h3: ({ ...props }) => (
                  <h3 className="text-md font-bold my-2" {...props} />
                ),
                strong: ({ ...props }) => (
                  <strong className="font-bold" {...props} />
                ),
              }}
            >
              {processContent(thinking)}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThinkingProcess;
