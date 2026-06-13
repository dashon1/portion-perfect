import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { format } from "date-fns";
import { Plus } from "lucide-react";
import MobileSelect from "@/components/ui/mobile-select";

export default function AddMealDialog({ date, mealType, recipes, onClose, onSuccess }) {
  const [selectedRecipeId, setSelectedRecipeId] = useState("");
  const [servings, setServings] = useState(1);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecipeId) return;

    setIsSubmitting(true);
    const mealData = {
      date: format(date, 'yyyy-MM-dd'),
      meal_type: mealType,
      recipe_id: selectedRecipeId,
      servings: servings,
      notes: notes
    };
    onSuccess(mealData);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Add {mealType.charAt(0).toUpperCase() + mealType.slice(1)} for {format(date, 'MMM d, yyyy')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="recipe">Recipe *</Label>
            <MobileSelect 
              value={selectedRecipeId} 
              onValueChange={setSelectedRecipeId}
              placeholder="Select a recipe"
              options={recipes.map((recipe) => ({ value: recipe.id, label: recipe.title }))}
            />
          </div>
          <div>
            <Label htmlFor="servings">Number of Servings</Label>
            <Input
              id="servings"
              type="number"
              inputMode="numeric"
              min="1"
              value={servings}
              onChange={(e) => setServings(parseInt(e.target.value) || 1)}
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special notes..."
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedRecipeId}>
              {isSubmitting ? (
                'Adding...'
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Meal
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}