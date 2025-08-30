import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  ConnectionMode,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Type, 
  Image, 
  MousePointer, 
  Square, 
  Save, 
  FolderOpen, 
  Trash2, 
  Plus,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react';

import TextNode from './nodes/TextNode';
import ImageNode from './nodes/ImageNode';
import ButtonNode from './nodes/ButtonNode';
import ContainerNode from './nodes/ContainerNode';
import { usePageBuilder } from '@/hooks/usePageBuilder';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const nodeTypes = {
  text: TextNode,
  image: ImageNode,
  button: ButtonNode,
  container: ContainerNode,
};

interface PageBuilderProps {
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  onPreview?: () => void;
  className?: string;
}

export const PageBuilder: React.FC<PageBuilderProps> = ({ 
  onSave, 
  onPreview, 
  className = '' 
}) => {
  const {
    nodes,
    edges,
    layouts,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    clearCanvas,
    saveLayout,
    loadLayout,
    deleteLayout,
    isSaving,
    isLoading,
    isDeleting
  } = usePageBuilder();

  const [layoutName, setLayoutName] = React.useState('');
  const [selectedLayoutId, setSelectedLayoutId] = React.useState('');

  // Handle drag and drop from toolbar
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      
      const reactFlowBounds = (event.target as Element).getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = {
        x: event.clientX - reactFlowBounds.left - 125,
        y: event.clientY - reactFlowBounds.top - 50,
      };

      addNode(type, position);
    },
    [addNode]
  );

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleSaveLayout = () => {
    if (!layoutName.trim()) {
      return;
    }
    
    saveLayout({
      name: layoutName,
      nodes,
      edges
    });
    
    setLayoutName('');
  };

  const handleLoadLayout = () => {
    if (!selectedLayoutId) {
      return;
    }
    
    loadLayout(selectedLayoutId);
  };

  const handleDeleteLayout = () => {
    if (!selectedLayoutId) {
      return;
    }
    
    deleteLayout(selectedLayoutId);
    setSelectedLayoutId('');
  };

  const handleExport = () => {
    const data = {
      nodes,
      edges,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `page-layout-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const nodeClassName = useCallback((node: Node) => {
    return node.type || 'default';
  }, []);

  return (
    <div className={`flex h-full w-full ${className}`}>
      {/* Sidebar - Node Palette & Controls */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Node Palette */}
        <Card className="m-4 mb-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Elements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {/* Text Node */}
              <div
                className="flex flex-col items-center p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-grab hover:border-blue-400 hover:bg-blue-50 transition-colors"
                draggable
                onDragStart={(event) => onDragStart(event, 'text')}
              >
                <Type className="h-6 w-6 text-gray-600 mb-1" />
                <span className="text-xs font-medium">Text</span>
              </div>

              {/* Image Node */}
              <div
                className="flex flex-col items-center p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-grab hover:border-purple-400 hover:bg-purple-50 transition-colors"
                draggable
                onDragStart={(event) => onDragStart(event, 'image')}
              >
                <Image className="h-6 w-6 text-gray-600 mb-1" />
                <span className="text-xs font-medium">Image</span>
              </div>

              {/* Button Node */}
              <div
                className="flex flex-col items-center p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-grab hover:border-green-400 hover:bg-green-50 transition-colors"
                draggable
                onDragStart={(event) => onDragStart(event, 'button')}
              >
                <MousePointer className="h-6 w-6 text-gray-600 mb-1" />
                <span className="text-xs font-medium">Button</span>
              </div>

              {/* Container Node */}
              <div
                className="flex flex-col items-center p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-grab hover:border-orange-400 hover:bg-orange-50 transition-colors"
                draggable
                onDragStart={(event) => onDragStart(event, 'container')}
              >
                <Square className="h-6 w-6 text-gray-600 mb-1" />
                <span className="text-xs font-medium">Container</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="mx-4" />

        {/* Layout Management */}
        <Card className="m-4 mb-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Layout Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Save Layout */}
            <div className="space-y-2">
              <Label htmlFor="layout-name" className="text-sm">Save Current Layout</Label>
              <div className="flex gap-2">
                <Input
                  id="layout-name"
                  placeholder="Layout name..."
                  value={layoutName}
                  onChange={(e) => setLayoutName(e.target.value)}
                  className="text-sm"
                />
                <Button
                  onClick={handleSaveLayout}
                  disabled={!layoutName.trim() || isSaving}
                  size="sm"
                  className="shrink-0"
                >
                  {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Load Layout */}
            <div className="space-y-2">
              <Label htmlFor="layout-select" className="text-sm">Load Saved Layout</Label>
              <div className="flex gap-2">
                <Select value={selectedLayoutId} onValueChange={setSelectedLayoutId}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select layout..." />
                  </SelectTrigger>
                  <SelectContent>
                    {layouts?.map((layout) => (
                      <SelectItem key={layout.id} value={layout.id!}>
                        {layout.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleLoadLayout}
                  disabled={!selectedLayoutId || isLoading}
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                >
                  {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FolderOpen className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={handleDeleteLayout}
                  disabled={!selectedLayoutId || isDeleting}
                  size="sm"
                  variant="outline"
                  className="shrink-0 text-red-600 hover:text-red-700"
                >
                  {isDeleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="mx-4" />

        {/* Actions */}
        <Card className="m-4 mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={clearCanvas} variant="outline" size="sm" className="w-full justify-start">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Canvas
            </Button>
            <Button onClick={handleExport} variant="outline" size="sm" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export Layout
            </Button>
            {onPreview && (
              <Button onClick={onPreview} variant="outline" size="sm" className="w-full justify-start">
                <Eye className="h-4 w-4 mr-2" />
                Preview Page
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          style={{ backgroundColor: '#f8fafc' }}
        >
          <Background color="#e2e8f0" size={1} />
          <Controls />
          <MiniMap 
            nodeColor={nodeClassName}
            nodeStrokeColor="#374151"
            nodeStrokeWidth={2}
            maskColor="rgba(0, 0, 0, 0.1)"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          
          <Panel position="top-center" className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-200">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Drag elements from the sidebar to build your page</span>
              <Separator orientation="vertical" className="h-4" />
              <span>{nodes.length} elements</span>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};