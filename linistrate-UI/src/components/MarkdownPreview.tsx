// components/MarkdownPreview.tsx
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css"; // You can choose different themes

interface Props {
  content: string;
}

const MarkdownPreview: React.FC<Props> = ({ content }) => {
  return (
    <div className="prose max-w-none dark:prose-invert">
      <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;
