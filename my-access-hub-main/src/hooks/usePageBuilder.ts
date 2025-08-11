import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Node, Edge, addEdge, Connection } from '@xyflow/react';
import { useToast } from '@/hooks/use-toast';

export interface PageLayout {
  id?: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export const usePageBuilder = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Page builder state
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

  // Fetch saved layouts
  const {
    data: layouts,
    isLoading: isLoadingLayouts,
    error: layoutsError
  } = useQuery({
    queryKey: ['page-layouts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_layouts' as any)
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return (data as unknown) as PageLayout[];
    }
  });

  // Save layout mutation
  const saveLayoutMutation = useMutation({
    mutationFn: async (layout: Omit<PageLayout, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const { data, error } = await supabase
        .from('page_layouts' as any)
        .insert({
          ...layout,
          nodes: nodes,
          edges: edges
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-layouts'] });
      toast({
        title: "Success",
        description: "Page layout saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save layout: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Load layout mutation
  const loadLayoutMutation = useMutation({
    mutationFn: async (layoutId: string) => {
      const { data, error } = await supabase
        .from('page_layouts' as any)
        .select('*')
        .eq('id', layoutId)
        .single();
      
      if (error) throw error;
      return (data as unknown) as PageLayout;
    },
    onSuccess: (layout) => {
      setNodes(layout.nodes || []);
      setEdges(layout.edges || []);
      toast({
        title: "Success",
        description: "Page layout loaded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to load layout: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete layout mutation
  const deleteLayoutMutation = useMutation({
    mutationFn: async (layoutId: string) => {
      const { error } = await supabase
        .from('page_layouts' as any)
        .delete()
        .eq('id', layoutId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-layouts'] });
      toast({
        title: "Success",
        description: "Page layout deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete layout: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Flow event handlers
  const onNodesChange = useCallback((changes: any) => {
    setNodes((nds) => {
      // Apply changes to nodes
      const updatedNodes = nds.map(node => {
        const change = changes.find((c: any) => c.id === node.id);
        if (change) {
          switch (change.type) {
            case 'position':
              return { ...node, position: change.position };
            case 'select':
              return { ...node, selected: change.selected };
            case 'remove':
              return null;
            default:
              return node;
          }
        }
        return node;
      }).filter(Boolean) as Node[];
      
      return updatedNodes;
    });
  }, []);

  const onEdgesChange = useCallback((changes: any) => {
    setEdges((eds) => {
      return eds.filter(edge => {
        const change = changes.find((c: any) => c.id === edge.id);
        return !change || change.type !== 'remove';
      });
    });
  }, []);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  }, []);

  // Add new node
  const addNode = useCallback((type: string, position: { x: number; y: number }) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: getDefaultNodeData(type),
      selected: false
    };
    
    setNodes((nds) => [...nds, newNode]);
    return newNode.id;
  }, []);

  // Remove node
  const removeNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter(node => node.id !== nodeId));
    setEdges((eds) => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
  }, []);

  // Update node data
  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) => 
      nds.map(node => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  }, []);

  // Clear all nodes and edges
  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNodes([]);
  }, []);

  return {
    // State
    nodes,
    edges,
    selectedNodes,
    layouts,
    isLoadingLayouts,
    layoutsError,
    
    // Mutations
    saveLayout: saveLayoutMutation.mutate,
    loadLayout: loadLayoutMutation.mutate,
    deleteLayout: deleteLayoutMutation.mutate,
    
    // Flow handlers
    onNodesChange,
    onEdgesChange,
    onConnect,
    setNodes,
    setEdges,
    
    // Node operations
    addNode,
    removeNode,
    updateNodeData,
    clearCanvas,
    
    // Loading states
    isSaving: saveLayoutMutation.isPending,
    isLoading: loadLayoutMutation.isPending,
    isDeleting: deleteLayoutMutation.isPending,
  };
};

// Helper function to get default data for different node types
function getDefaultNodeData(type: string) {
  switch (type) {
    case 'text':
      return {
        text: 'Enter your text here',
        fontSize: 'text-base',
        fontWeight: 'font-normal',
        textAlign: 'text-left',
        color: 'text-gray-900'
      };
    case 'image':
      return {
        src: '',
        alt: 'Image',
        width: 'auto',
        height: 'auto',
        objectFit: 'cover'
      };
    case 'button':
      return {
        text: 'Click me',
        href: '',
        variant: 'default',
        size: 'default',
        className: ''
      };
    case 'container':
      return {
        backgroundColor: '#ffffff',
        padding: '16px',
        margin: '0',
        borderRadius: '8px',
        border: '2px dashed #e2e8f0',
        width: '300px',
        height: '200px',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      };
    default:
      return {};
  }
}