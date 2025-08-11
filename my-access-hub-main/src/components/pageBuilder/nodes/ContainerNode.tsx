import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

interface ContainerNodeData {
  backgroundColor: string;
  padding: string;
  margin: string;
  borderRadius: string;
  border: string;
  width: string;
  height: string;
  flexDirection: string;
  justifyContent: string;
  alignItems: string;
}

interface ContainerNodeProps {
  data: ContainerNodeData;
  id: string;
}

const ContainerNode = memo(({ data, id }: ContainerNodeProps) => {
  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="w-2 h-2" />
      <div 
        className="border-2 border-dashed border-muted-foreground/25 rounded flex items-center justify-center"
        style={{
          backgroundColor: data.backgroundColor || '#ffffff',
          padding: data.padding || '16px',
          margin: data.margin || '0',
          borderRadius: data.borderRadius || '8px',
          width: data.width || '300px',
          height: data.height || '200px',
          flexDirection: data.flexDirection as any || 'column',
          justifyContent: data.justifyContent || 'center',
          alignItems: data.alignItems || 'center'
        }}
      >
        <span className="text-muted-foreground text-sm">Container</span>
        <span className="text-muted-foreground text-xs">Drop elements here</span>
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2" />
    </div>
  );
});

ContainerNode.displayName = 'ContainerNode';

export default ContainerNode;