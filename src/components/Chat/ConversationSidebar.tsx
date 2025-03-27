
import React, { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useChat } from '../../context/ChatContext';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

interface ConversationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({ isOpen, onClose }) => {
  const { 
    conversations, 
    currentConversation, 
    createNewConversation, 
    switchConversation,
    deleteConversation,
    updateConversationTitle
  } = useChat();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const startEditing = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  const saveEditing = () => {
    if (editingId) {
      updateConversationTitle(editingId, editingTitle.trim());
      setEditingId(null);
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEditing();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  // Sort conversations by updatedAt (newest first)
  const sortedConversations = [...conversations].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );

  return (
    <div className={`fixed inset-y-0 left-0 z-20 w-64 bg-background border-r shadow-lg transform transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">Chat History</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X size={18} />
          </Button>
        </div>
        
        <div className="p-2">
          <Button onClick={createNewConversation} className="w-full flex items-center gap-2">
            <Plus size={16} />
            New Chat
          </Button>
        </div>
        
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 py-2">
            {sortedConversations.map((conversation) => (
              <div 
                key={conversation.id}
                className={`group rounded-md p-2 cursor-pointer transition-colors ${
                  currentConversation?.id === conversation.id 
                    ? 'bg-accent text-accent-foreground' 
                    : 'hover:bg-muted'
                }`}
              >
                <div 
                  className="flex items-center justify-between"
                  onClick={() => editingId !== conversation.id && switchConversation(conversation.id)}
                >
                  <div className="flex-1 min-w-0">
                    {editingId === conversation.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          className="h-7 text-sm"
                        />
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={saveEditing}>
                          <Check size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelEditing}>
                          <X size={14} />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="truncate text-sm font-medium">
                          {conversation.title || "Untitled Chat"}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {format(conversation.updatedAt, 'MMM d, yyyy')}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {editingId !== conversation.id && (
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-7 w-7" 
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(conversation.id, conversation.title);
                        }}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive" 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conversation.id);
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ConversationSidebar;
