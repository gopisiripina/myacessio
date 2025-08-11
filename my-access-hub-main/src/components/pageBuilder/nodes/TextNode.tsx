import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

interface TextNodeData {
  text: string;
  fontSize: string;
  fontWeight: string;
  textAlign: string;
  color: string;
}

interface TextNodeProps {
  data: TextNodeData;
  id: string;
}

const TextNode = memo(({ data, id }: TextNodeProps) => {
  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="w-2 h-2" />
      <div 
        className={`p-4 min-w-[200px] bg-background border border-border rounded-lg ${data.fontSize} ${data.fontWeight} ${data.textAlign} ${data.color}`}
        style={{ color: data.color === 'custom' ? '#000' : undefined }}
      >
        {data.text || 'Enter your text here'}
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2" />
    </div>
  );
});

TextNode.displayName = 'TextNode';

export default TextNode;