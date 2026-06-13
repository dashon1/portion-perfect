import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Clock, Users, ChefHat, Heart, Trash2, Edit, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import MobileRecipeHeader from "../components/recipes/MobileRecipeHeader";
import RecipeScaler from "../components/recipes/RecipeScaler";
import IngredientsList from "../components/recipes/IngredientsList";
import InstructionsList from "../components/recipes/InstructionsList";
import RatingStars from "../components/recipes/RatingStars";
import NutritionDisplay from "../components/recipes/NutritionDisplay";
import RecipeNotes from "../components/recipes/RecipeNotes";
import RecipeAIAdvisor from "../components/recipes/RecipeAIAdvisor";

export default function RecipeDetailPage() {
  const [recipe, setRecipe] = useState(null);
  const [scaledServings, setScaledServings] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = urlParams.get('id');

  useEffect(() => {
    if (recipeId) {
      const loadRecipe = async () => {
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
      
      loadRecipe();
    }
  }, [recipeId]);

  useEffect(() => {
    if (recipe) {
      setScaledServings(recipe.original_servings);
    }
  }, [recipe]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-2xl mb-6"></div>
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-8"></div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
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

  const scalingFactor = scaledServings / recipe.original_servings;
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  const handleToggleFavorite = async () => {
    await base44.entities.Recipe.update(recipe.id, {
      ...recipe,
      is_favorite: !recipe.is_favorite
    });
    setRecipe({ ...recipe, is_favorite: !recipe.is_favorite });
  };

  const handleRatingChange = async (newRating) => {
    await base44.entities.Recipe.update(recipe.id, {
      ...recipe,
      rating: newRating
    });
    setRecipe({ ...recipe, rating: newRating });
  };

  const handleNotesUpdate = async (newNotes) => {
    await base44.entities.Recipe.update(recipe.id, {
      ...recipe,
      notes: newNotes
    });
    setRecipe({ ...recipe, notes: newNotes });
  };

  const handleDeleteRecipe = async () => {
    await base44.entities.Recipe.delete(recipe.id);
    navigate(createPageUrl("Recipes"));
  };

  const handleDuplicateRecipe = async () => {
    const { id, created_date, updated_date, created_by, ...recipeData } = recipe;
    const duplicatedRecipe = await base44.entities.Recipe.create({
      ...recipeData,
      title: `${recipe.title} (Copy)`,
      is_favorite: false
    });
    navigate(createPageUrl(`RecipeDetail?id=${duplicatedRecipe.id}`));
  };

  const handleExportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text(recipe.title, 20, 20);
    
    doc.setFontSize(12);
    let y = 35;
    
    if (recipe.description) {
      doc.text(`Description: ${recipe.description}`, 20, y);
      y += 10;
    }
    
    doc.text(`Servings: ${scaledServings} (scaled from ${recipe.original_servings})`, 20, y);
    y += 10;
    
    if (recipe.prep_time || recipe.cook_time) {
      doc.text(`Time: ${recipe.prep_time || 0} min prep + ${recipe.cook_time || 0} min cook`, 20, y);
      y += 15;
    }
    
    doc.setFontSize(14);
    doc.text('Ingredients:', 20, y);
    y += 8;
    
    doc.setFontSize(11);
    (recipe.ingredients || []).forEach((ing) => {
      const scaledAmount = (ing.amount * scalingFactor).toFixed(2);
      doc.text(`• ${scaledAmount} ${ing.unit} ${ing.name}`, 25, y);
      y += 7;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
    
    y += 10;
    doc.setFontSize(14);
    doc.text('Instructions:', 20, y);
    y += 8;
    
    doc.setFontSize(11);
    (recipe.instructions || []).forEach((instruction, index) => {
      const lines = doc.splitTextToSize(`${index + 1}. ${instruction}`, 170);
      lines.forEach(line => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 25, y);
        y += 7;
      });
      y += 3;
    });
    
    doc.save(`${recipe.title.replace(/[^a-z0-9]/gi, '_')}.pdf`);
  };

  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800"
  };

  return (
    <div className="min-h-screen">
      <MobileRecipeHeader 
        title={recipe?.title || "Recipe"} 
        onBack={() => navigate(createPageUrl("Recipes"))}
      />
      
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen p-6"
      >
        <div className="max-w-4xl mx-auto">
          <div className="hidden md:flex items-center justify-between mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate(createPageUrl("Recipes"))}
              className="border-orange-200 hover:bg-orange-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Recipes
            </Button>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => navigate(createPageUrl(`EditRecipe?id=${recipe.id}`))}
                  className="border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDuplicateRecipe}
                  className="border-purple-300 hover:bg-purple-50 hover:text-purple-700"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportPDF}
                  className="border-green-300 hover:bg-green-50 hover:text-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleFavorite}
                  className={recipe.is_favorite ? "bg-pink-50 border-pink-300 hover:bg-pink-100" : ""}
                >
                  <Heart className={`w-5 h-5 ${recipe.is_favorite ? 'fill-pink-500 text-pink-500' : ''}`} />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this recipe? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteRecipe}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

        {/* Recipe Header */}
        <div className="relative mb-8">
          {recipe.image_url && (
            <div className="h-64 md:h-80 rounded-2xl overflow-hidden mb-6">
              <img 
                src={recipe.image_url} 
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              {recipe.title}
            </h1>
            <div className="flex gap-2">
              {recipe.difficulty && (
                <Badge className={`${difficultyColors[recipe.difficulty]} text-sm`}>
                  {recipe.difficulty}
                </Badge>
              )}
              <Badge className="bg-orange-100 text-orange-800 text-sm">
                {recipe.category?.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          
          {recipe.description && (
            <p className="text-lg text-gray-600 mb-4">
              {recipe.description}
            </p>
          )}

          <div className="mb-6">
            <RatingStars rating={recipe.rating} onRatingChange={handleRatingChange} size="lg" />
          </div>

          <div className="flex flex-wrap items-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-5 h-5 text-orange-500" />
              <span className="font-medium">Originally serves {recipe.original_servings}</span>
            </div>
            {totalTime > 0 && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="font-medium">{totalTime} minutes</span>
              </div>
            )}
            {recipe.cuisine && (
              <div className="flex items-center gap-2 text-gray-600">
                <ChefHat className="w-5 h-5 text-orange-500" />
                <span className="font-medium">{recipe.cuisine}</span>
              </div>
            )}
          </div>
        </div>

        {/* Recipe Scaler */}
        <div className="mb-8">
          <RecipeScaler 
            originalServings={recipe.original_servings}
            currentServings={scaledServings}
            onServingsChange={setScaledServings}
          />
        </div>

        {/* Nutrition Information */}
        {recipe.nutrition && (
          <div className="mb-8">
            <NutritionDisplay nutrition={recipe.nutrition} scalingFactor={scalingFactor} />
          </div>
        )}

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <IngredientsList 
              ingredients={recipe.ingredients || []}
              scalingFactor={scalingFactor}
            />
          </div>
          
          <div>
            <InstructionsList 
              instructions={recipe.instructions || []}
              scalingFactor={scalingFactor}
            />
          </div>
        </div>

        {/* Recipe Notes */}
        <div className="mb-8">
          <RecipeNotes notes={recipe.notes} onSave={handleNotesUpdate} />
        </div>

        {/* AI Assistant */}
        <div className="mb-8">
          <RecipeAIAdvisor recipe={recipe} />
        </div>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="bg-gray-50">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
        </div>
        </motion.div>
        </div>
        );
        }