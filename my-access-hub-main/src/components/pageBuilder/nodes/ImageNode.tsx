import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

interface ImageNodeData {
  src: string;
  alt: string;
  width: string;
  height: string;
  objectFit: string;
}

interface ImageNodeProps {
  data: ImageNodeData;
  id: string;
}

const ImageNode = memo(({ data, id }: ImageNodeProps) => {
  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="w-2 h-2" />
      <div className="p-2 bg-background border border-border rounded-lg">
        {data.src ? (
          <img
            src={data.src}
            alt={data.alt || 'Image'}
            className={`rounded ${data.objectFit === 'cover' ? 'object-cover' : 'object-contain'}`}
            style={{
              width: data.width === 'auto' ? 'auto' : data.width || '200px',
              height: data.height === 'auto' ? 'auto' : data.height || '150px',
              maxWidth: '300px',
              maxHeight: '300px'
            }}
          />
        ) : (
          <div 
            className="bg-muted border-2 border-dashed border-muted-foreground/25 rounded flex items-center justify-center text-muted-foreground"
            style={{
              width: data.width === 'auto' ? '200px' : data.width || '200px',
              height: data.height === 'auto' ? '150px' : data.height || '150px'
            }}
          >
            <span className="text-sm">Click to add image</span>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2" />
    </div>
  );
});

ImageNode.displayName = 'ImageNode';

export default ImageNode;