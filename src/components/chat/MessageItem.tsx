import Markdown from 'react-markdown';

export const MessageItem = ({ msg }: any) => {
  return (
    <div className="py-4 px-4 max-w-3xl mx-auto w-full text-foreground leading-relaxed">
      <div className="markdown-body prose dark:prose-invert max-w-none">
        <Markdown>{msg.content}</Markdown>
      </div>
    </div>
  );
};
