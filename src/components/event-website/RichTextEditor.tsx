'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Undo2,
  Redo2,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  color?: string;
  placeholder?: string;
}

function isHtml(value: string) {
  return /<\/?[a-z][\s\S]*?>/i.test(value);
}

function textToHtml(value: string) {
  if (!value) return '';
  return value
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, '<br/>')}</p>`)
    .join('');
}

export default function RichTextEditor({
  value,
  onChange,
  color,
  placeholder = 'Write your description…',
}: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isEmpty, setIsEmpty] = useState(!value);

  useEffect(() => {
    if (!ref.current) return;
    const current = ref.current.innerHTML;
    const incoming = isHtml(value) ? value : textToHtml(value);
    if (current !== incoming) {
      ref.current.innerHTML = incoming;
      setIsEmpty(!ref.current.textContent);
    }
  }, [value]);

  function exec(command: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  }

  function emit() {
    if (!ref.current) return;
    const html = ref.current.innerHTML;
    setIsEmpty(!ref.current.textContent);
    onChange(html);
  }

  function promptLink() {
    const url = window.prompt('Enter URL');
    if (!url) return;
    exec('createLink', url);
  }

  const buttons: { title: string; icon: React.ComponentType<{ className?: string }>; run: () => void }[] = [
    { title: 'Bold', icon: Bold, run: () => exec('bold') },
    { title: 'Italic', icon: Italic, run: () => exec('italic') },
    { title: 'Underline', icon: Underline, run: () => exec('underline') },
    { title: 'Heading 1', icon: Heading1, run: () => exec('formatBlock', '<h1>') },
    { title: 'Heading 2', icon: Heading2, run: () => exec('formatBlock', '<h2>') },
    { title: 'Bulleted list', icon: List, run: () => exec('insertUnorderedList') },
    { title: 'Numbered list', icon: ListOrdered, run: () => exec('insertOrderedList') },
    { title: 'Align left', icon: AlignLeft, run: () => exec('justifyLeft') },
    { title: 'Align center', icon: AlignCenter, run: () => exec('justifyCenter') },
    { title: 'Align right', icon: AlignRight, run: () => exec('justifyRight') },
    { title: 'Link', icon: LinkIcon, run: promptLink },
    { title: 'Undo', icon: Undo2, run: () => exec('undo') },
    { title: 'Redo', icon: Redo2, run: () => exec('redo') },
  ];

  return (
    <div className="rounded-xl border border-black/10 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-black/10 bg-[#FAF6F1] px-2 py-1.5">
        {buttons.map(({ title, icon: Icon, run }, i) => (
          <button
            key={title}
            type="button"
            title={title}
            onMouseDown={(e) => {
              e.preventDefault();
              run();
            }}
            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-[#1B1A17] hover:bg-black/5 transition-colors"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
      <div className="relative">
        <div
          ref={ref}
          contentEditable
          onInput={emit}
          onBlur={emit}
          suppressContentEditableWarning
          className="min-h-[200px] px-5 py-4 text-[15px] leading-relaxed focus:outline-none rte-body"
          style={{ color: color ?? '#1B1A17' }}
          data-placeholder={placeholder}
        />
        {isEmpty && (
          <span className="pointer-events-none absolute top-4 left-5 text-[15px] text-black/40">
            {placeholder}
          </span>
        )}
      </div>
      <style jsx global>{`
        .rte-body p {
          margin: 0 0 0.75em;
        }
        .rte-body h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5em;
        }
        .rte-body h2 {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0 0 0.5em;
        }
        .rte-body ul {
          list-style: disc;
          padding-left: 1.4em;
          margin: 0 0 0.75em;
        }
        .rte-body ol {
          list-style: decimal;
          padding-left: 1.4em;
          margin: 0 0 0.75em;
        }
        .rte-body a {
          color: #2f6f9e;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
