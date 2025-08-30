import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Button } from '@/components/ui/button';

interface ButtonNodeData {
  text: string;
  href: string;
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size: 'default' | 'sm' | 'lg' | 'icon';
  className: string;
}

interface ButtonNodeProps {
  data: ButtonNodeData;
  id: string;
}

const ButtonNode = memo(({ data, id }: ButtonNodeProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (data.href) {
      window.open(data.href, '_blank');
    }
  };

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="w-2 h-2" />
      <div className="p-2">
        <Button
          variant={data.variant || 'default'}
          size={data.size || 'default'}
          onClick={handleClick}
          className={data.className}
        >
          {data.text || 'Click me'}
        </Button>
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2" />
    </div>
  );
});

ButtonNode.displayName = 'ButtonNode';

export default ButtonNode;