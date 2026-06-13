import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Save } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import MobileRecipeHeader from "../components/recipes/MobileRecipeHeader";
import RecipeForm from "../components/recipes/RecipeForm";

export default function EditRecipePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = urlParams.get('id');

  useEffect(() => {
    if (recipeId) {
      loadRecipe();
    }
  }, [recipeId]);

  const loadRecipe = async () => {
    setIsLoading(true);
    try {
      const recipes = await base44.entities.Recipe.filter({ id: recipeId });
      if (recipes.length > 0) {
        setRecipe(recipes[0]);
      }
    } catch (error) {
      console.error("Error loading recipe:", error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (recipeData) => {
    setIsSubmitting(true);
    try {
      // Optimistic update: update cache immediately
      const updatedRecipe = { ...recipe, ...recipeData, updated_date: new Date().toISOString() };
      
      queryClient.setQueryData(['recipes'], (old) => {
        return old ? old.map(r => r.id === recipeId ? updatedRecipe : r) : old;
      });
      
      // Navigate immediately for faster perceived performance
      navigate(createPageUrl(`RecipeDetail?id=${recipeId}`));
      
      // Update in background
      await base44.entities.Recipe.update(recipeId, recipeData);
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    } catch (error) {
      console.error("Error updating recipe:", error);
      // Rollback optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="h-12 bg-gray-200 rounded w-64"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Recipe not found</h2>
          <Button onClick={() => navigate(createPageUrl("Recipes"))}>
            Back to Recipes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <MobileRecipeHeader 
        title="Edit Recipe" 
        onBack={() => navigate(createPageUrl(`RecipeDetail?id=${recipeId}`))}
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
            onClick={() => navigate(createPageUrl(`RecipeDetail?id=${recipeId}`))}
            className="mb-6 border-orange-200 hover:bg-orange-50 hidden md:inline-flex"
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Recipe
          </Button>

          <div className="mb-8 hidden md:block">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Edit Recipe</h1>
            <p className="text-gray-600">Make changes and improvements to your recipe</p>
          </div>

          <RecipeForm 
            initialRecipe={recipe}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitButtonText="Save Changes"
            submitIcon={Save}
          />
        </div>
      </motion.div>
    </div>
  );
}