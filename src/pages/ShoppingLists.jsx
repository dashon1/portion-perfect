import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Trash2, Check, Plus } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";

export default function ShoppingListsPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { data: shoppingLists = [], isLoading } = useQuery({
    queryKey: ['shoppingLists'],
    queryFn: () => base44.entities.ShoppingList.list('-created_date')
  });

  const updateListMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ShoppingList.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingLists'] });
    }
  });

  const deleteListMutation = useMutation({
    mutationFn: (id) => base44.entities.ShoppingList.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingLists'] });
    }
  });

  const createListMutation = useMutation({
    mutationFn: (data) => base44.entities.ShoppingList.create(data),
    onMutate: async (newList) => {
      await queryClient.cancelQueries({ queryKey: ['shoppingLists'] });
      const previous = queryClient.getQueryData(['shoppingLists']);
      queryClient.setQueryData(['shoppingLists'], (old) => [
        { id: `temp-${Date.now()}`, ...newList, created_date: new Date() },
        ...(old || [])
      ]);
      return { previous };
    },
    onError: (err, newList, context) => {
      queryClient.setQueryData(['shoppingLists'], context.previous);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingLists'] });
      setIsDialogOpen(false);
      setNewListName("");
      setIsCreating(false);
    }
  });

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    setIsCreating(true);
    await createListMutation.mutate({
      name: newListName,
      items: []
    });
  };

  const toggleItemChecked = (listId, list, itemIndex) => {
    const updatedItems = [...list.items];
    updatedItems[itemIndex].checked = !updatedItems[itemIndex].checked;
    
    // Optimistic update
    queryClient.setQueryData(['shoppingLists'], (old) =>
      old?.map(l => l.id === listId ? { ...l, items: updatedItems } : l) || []
    );
    
    updateListMutation.mutate({
      id: listId,
      data: { ...list, items: updatedItems }
    });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Shopping Lists</h1>
            <p className="text-base text-gray-600">Manage your grocery shopping</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg">
                <Plus className="w-5 h-5 mr-2" />
                Create List
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Shopping List</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="e.g., Weekly Groceries, Party Supplies"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateList();
                    }
                  }}
                  disabled={isCreating}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateList}
                  disabled={isCreating || !newListName.trim()}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {isCreating ? "Creating..." : "Create List"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-48" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array(5).fill(0).map((_, j) => (
                      <div key={j} className="h-4 bg-gray-200 rounded" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : shoppingLists.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Shopping Lists Yet</h3>
              <p className="text-base text-gray-600">
                Create meal plans and generate shopping lists automatically
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {shoppingLists.map((list) => {
              const checkedCount = list.items?.filter(item => item.checked).length || 0;
              const totalCount = list.items?.length || 0;
              const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

              return (
                <Card key={list.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <ShoppingCart className="w-5 h-5 text-green-500" />
                          {list.name}
                        </CardTitle>
                        {list.created_for_date && (
                          <p className="text-base text-gray-600 mt-1">
                            {format(new Date(list.created_for_date), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteListMutation.mutate(list.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-base text-gray-600 mb-1">
                        <span>{checkedCount} of {totalCount} items</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {list.items?.map((item, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-3 p-3 rounded-lg border ${
                            item.checked
                              ? 'bg-gray-50 border-gray-200'
                              : 'bg-white border-green-200'
                          }`}
                        >
                          <Checkbox
                            checked={item.checked}
                            onCheckedChange={() => toggleItemChecked(list.id, list, index)}
                          />
                          <div className="flex-1">
                            <span className={`font-medium ${item.checked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {item.ingredient}
                            </span>
                            <span className={`ml-2 ${item.checked ? 'text-gray-400' : 'text-gray-600'}`}>
                              {item.amount.toFixed(2)} {item.unit}
                            </span>
                          </div>
                          {item.checked && (
                            <Check className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}