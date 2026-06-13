import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Save } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import MobileRecipeHeader from "../components/recipes/MobileRecipeHeader";
import RecipeForm from "../components/recipes/RecipeForm";

export default function AddRecipePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (recipeData) => {
    setIsSubmitting(true);
    try {
      // Optimistic update: add to cache immediately with temporary ID
      const tempId = `temp-${Date.now()}`;
      const optimisticRecipe = { ...recipeData, id: tempId, created_date: new Date().toISOString() };
      
      queryClient.setQueryData(['recipes'], (old) => {
        return old ? [optimisticRecipe, ...old] : [optimisticRecipe];
      });
      
      // Navigate immediately for faster perceived performance
      navigate(createPageUrl("Recipes"));
      
      // Create in background and update cache with real data
      const newRecipe = await base44.entities.Recipe.create(recipeData);
      queryClient.setQueryData(['recipes'], (old) => {
        return old ? old.map(r => r.id === tempId ? newRecipe : r) : [newRecipe];
      });
    } catch (error) {
      console.error("Error creating recipe:", error);
      // Rollback optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <MobileRecipeHeader 
        title="Add New Recipe" 
        onBack={() => navigate(createPageUrl("Recipes"))}
      />

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen p-6"
      >
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="outline" 
            onClick={() => navigate(createPageUrl("Recipes"))}
            className="mb-6 border-orange-200 hover:bg-orange-50 hidden md:inline-flex"
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Recipes
          </Button>

          <div className="mb-8 hidden md:block">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Add New Recipe</h1>
            <p className="text-gray-600">Create a new recipe that can be easily scaled for any number of servings</p>
          </div>

          <RecipeForm 
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitButtonText="Save Recipe"
            submitIcon={Save}
          />
        </div>
      </motion.div>
    </div>
  );
}