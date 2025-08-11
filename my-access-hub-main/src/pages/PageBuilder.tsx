import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePageBuilder } from '@/hooks/usePageBuilder';
import { useAuth } from '@/hooks/useAuth';
import { PageBuilder as PageBuilderComponent } from '@/components/pageBuilder/PageBuilder';
import { Plus, Save, FolderOpen, Trash2, Type, Image, MousePointer, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function PageBuilder() {
  const { user } = useAuth();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [layoutName, setLayoutName] = useState('');

  const {
    nodes,
    edges,
    layouts,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    saveLayout,
    loadLayout,
    deleteLayout,
    clearCanvas,
    isSaving,
    isLoading,
    isDeleting,
  } = usePageBuilder();

  // If not authenticated, redirect to login
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Page Builder</h1>
          <p className="text-muted-foreground mb-4">Please log in to access the page builder</p>
          <Button onClick={() => window.location.href = '/'}>Go to Login</Button>
        </div>
      </div>
    );
  }

  const handleAddNode = (type: string) => {
    const position = {
      x: Math.random() * 300 + 100,
      y: Math.random() * 300 + 100,
    };
    addNode(type, position);
  };

  const handleSaveLayout = () => {
    if (!layoutName.trim()) {
      toast.error('Please enter a layout name');
      return;
    }
    saveLayout({ name: layoutName.trim(), nodes, edges });
    setLayoutName('');
    setSaveDialogOpen(false);
  };

  const handleLoadLayout = (layoutId: string) => {
    loadLayout(layoutId);
    setLoadDialogOpen(false);
  };

  const handleDeleteLayout = (layoutId: string) => {
    deleteLayout(layoutId);
    toast.success('Layout deleted successfully');
  };

  return (
    <div className="h-screen flex">
      {/* Left Sidebar - Element Library */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        <Card className="border-0 rounded-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Page Builder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Toolbar */}
            <div className="flex gap-2">
              <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Layout</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="layoutName">Layout Name</Label>
                      <Input
                        id="layoutName"
                        value={layoutName}
                        onChange={(e) => setLayoutName(e.target.value)}
                        placeholder="Enter layout name"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveLayout} disabled={isSaving} className="flex-1">
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <FolderOpen className="w-4 h-4 mr-1" />
                    Load
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Load Layout</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="max-h-96">
                    <div className="space-y-2">
                      {layouts?.map((layout) => (
                        <div key={layout.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{layout.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(layout.created_at!).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleLoadLayout(layout.id!)}
                              disabled={isLoading}
                            >
                              Load
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteLayout(layout.id!)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {(!layouts || layouts.length === 0) && (
                        <p className="text-center text-muted-foreground py-4">No saved layouts</p>
                      )}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>

            <Button variant="destructive" size="sm" onClick={clearCanvas} className="w-full">
              Clear Canvas
            </Button>

            {/* Element Library */}
            <div>
              <Label className="text-sm font-medium">Elements</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddNode('text')}
                  className="h-20 flex-col gap-1"
                >
                  <Type className="w-6 h-6" />
                  <span className="text-xs">Text</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddNode('image')}
                  className="h-20 flex-col gap-1"
                >
                  <Image className="w-6 h-6" />
                  <span className="text-xs">Image</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddNode('button')}
                  className="h-20 flex-col gap-1"
                >
                  <MousePointer className="w-6 h-6" />
                  <span className="text-xs">Button</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddNode('container')}
                  className="h-20 flex-col gap-1"
                >
                  <Package className="w-6 h-6" />
                  <span className="text-xs">Container</span>
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium">How to use:</p>
              <ul className="space-y-1 text-xs">
                <li>• Click elements above to add them to canvas</li>
                <li>• Drag elements to position them</li>
                <li>• Connect elements by dragging from handles</li>
                <li>• Select elements to edit properties</li>
                <li>• Save your layouts for later use</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative">
        <PageBuilderComponent />
      </div>
    </div>
  );
}