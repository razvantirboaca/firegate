import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

function RecentLogsDrawer({ isOpen, onClose, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleExport = (content) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `nova-log-${timestamp}.md`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full sm:w-1/2 bg-amber-50 shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
      <div className="p-4 border-b border-amber-200 flex justify-between items-center">
        <h2 className="font-semibold">Recent Logs</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl">
          &times;
        </button>
      </div>

      <div className="p-4 overflow-y-auto h-[calc(100%-64px)] space-y-4">
        {React.Children.map(children, (child) => {
          if (!child) return null; // guard against null, undefined, false

          const isString = typeof child === 'string';
          const isMarkdownLog = child?.props?.['data-markdown'];

          let content = null;
          if (isString) {
            content = child;
          } else if (isMarkdownLog && typeof child.props.children === 'string') {
            content = child.props.children;
          }

          if (content !== null) {
            return (
              <div className="relative group">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
                <button
                  onClick={() => handleExport(content)}
                  className="absolute top-2 right-2 text-xs text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Export to Markdown">
                  📝 Export
                </button>
              </div>
            );
          }

          return <div>{child}</div>;
        })}
      </div>
    </div>
  );
}

export default RecentLogsDrawer;
