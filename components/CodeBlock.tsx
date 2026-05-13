
import React, { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-2xl overflow-hidden bg-[#0c0c0c] border border-white/5 shadow-2xl">
      <div className="flex items-center justify-between px-6 py-3 bg-white/5 border-b border-white/5">
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">{language}</span>
        <button
          onClick={handleCopy}
          className="text-[10px] font-bold text-white/40 hover:text-white transition-colors uppercase tracking-[0.1em]"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-8 overflow-x-auto custom-scrollbar bg-transparent text-white/90">
        <code className="text-[13px] font-mono leading-relaxed block whitespace-pre-wrap break-words">
          {code}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;
