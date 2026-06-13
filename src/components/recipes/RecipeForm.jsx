import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { Plus, Minus, Clock, Users, Camera } from "lucide-react";
import MobileSelect from "@/components/ui/mobile-select";

const categories = [
  { value: "appetizer", label: "Appetizer" },
  { value: "main_course", label: "Main Course" },
  { value: "dessert", label: "Dessert" },
  { value: "side_dish", label: "Side Dish" },
  { value: "beverage", label: "Beverage" },
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" }
];

export default function RecipeForm({ onSubmit, isSubmitting, submitButtonText, submitIcon: SubmitIcon, initialRecipe = null }) {
  const [recipe, setRecipe] = useState(() => {
    if (initialRecipe) {
      return {
        ...initialRecipe,
        ingredients: initialRecipe.ingredients || [{ name: "", amount: 0, unit: "" }],
        instructions: initialRecipe.instructions || [""],
        tags: initialRecipe.tags || [],
        nutrition: initialRecipe.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 }
      };
    }
    return {
      title: "",
      description: "",
      original_servings: 4,
      prep_time: 0,
      cook_time: 0,
      ingredients: [{ name: "", amount: 0, unit: "" }],
      instructions: [""],
      category: "main_course",
      cuisine: "",
      image_url: "",
      difficulty: "medium",
      tags: [],
      nutrition: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      }
    };
  });

  const [tagInput, setTagInput] = useState("");

  const handleInputChange = (field, value) => {
    setRecipe(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...recipe.ingredients];
    newIngredients[index] = {
      ...newIngredients[index],
      [field]: field === 'amount' ? parseFloat(value) || 0 : value
    };
    setRecipe(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  const addIngredient = () => {
    setRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: "", amount: 0, unit: "" }]
    }));
  };

  const removeIngredient = (index) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...recipe.instructions];
    newInstructions[index] = value;
    setRecipe(prev => ({
      ...prev,
      instructions: newInstructions
    }));
  };

  const addInstruction = () => {
    setRecipe(prev => ({
      ...prev,
      instructions: [...prev.instructions, ""]
    }));
  };

  const removeInstruction = (index) => {
    setRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !recipe.tags.includes(tagInput.trim())) {
      setRecipe(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setRecipe(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleNutritionChange = (field, value) => {
    setRecipe(prev => ({
      ...prev,
      nutrition: {
        ...prev.nutrition,
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Clean up empty ingredients and instructions
    const cleanedRecipe = {
      ...recipe,
      ingredients: recipe.ingredients.filter(ing => ing.name.trim() && ing.amount > 0),
      instructions: recipe.instructions.filter(inst => inst.trim())
    };
    onSubmit(cleanedRecipe);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Recipe Title *</Label>
            <Input
              id="title"
              value={recipe.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Grandma's Chocolate Chip Cookies"
              required
              className="border-orange-200 focus:border-orange-400"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={recipe.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of your recipe..."
              className="border-orange-200 focus:border-orange-400 h-20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="servings" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Original Servings *
              </Label>
              <Input
                  id="servings"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  value={recipe.original_servings}
                  onChange={(e) => handleInputChange('original_servings', parseInt(e.target.value))}
                  required
                  className="border-orange-200 focus:border-orange-400"
                />
            </div>
            
            <div>
              <Label htmlFor="prep_time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Prep Time (min)
              </Label>
              <Input
                id="prep_time"
                type="number"
                inputMode="numeric"
                min="0"
                value={recipe.prep_time}
                onChange={(e) => handleInputChange('prep_time', parseInt(e.target.value))}
                className="border-orange-200 focus:border-orange-400"
              />
            </div>
            
            <div>
              <Label htmlFor="cook_time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Cook Time (min)
              </Label>
              <Input
                id="cook_time"
                type="number"
                inputMode="numeric"
                min="0"
                value={recipe.cook_time}
                onChange={(e) => handleInputChange('cook_time', parseInt(e.target.value))}
                className="border-orange-200 focus:border-orange-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <MobileSelect 
                value={recipe.category} 
                onValueChange={(value) => handleInputChange('category', value)}
                placeholder="Select category"
                options={categories}
              />
            </div>

            <div>
              <Label htmlFor="cuisine">Cuisine Type</Label>
              <Input
                id="cuisine"
                value={recipe.cuisine}
                onChange={(e) => handleInputChange('cuisine', e.target.value)}
                placeholder="e.g., Italian, Mexican, Thai..."
                className="border-orange-200 focus:border-orange-400"
              />
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <MobileSelect 
                value={recipe.difficulty} 
                onValueChange={(value) => handleInputChange('difficulty', value)}
                placeholder="Select difficulty"
                options={[
                  { value: "easy", label: "Easy" },
                  { value: "medium", label: "Medium" },
                  { value: "hard", label: "Hard" }
                ]}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="image_url" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Recipe Photo URL
            </Label>
            <Input
              id="image_url"
              value={recipe.image_url}
              onChange={(e) => handleInputChange('image_url', e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="border-orange-200 focus:border-orange-400"
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tag and press Enter"
                className="border-orange-200 focus:border-orange-400"
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-orange-900"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nutrition Information */}
      <Card>
        <CardHeader>
          <CardTitle>Nutrition Information (per serving)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                inputMode="numeric"
                min="0"
                value={recipe.nutrition.calories}
                onChange={(e) => handleNutritionChange('calories', e.target.value)}
                className="border-orange-200 focus:border-orange-400"
              />
            </div>
            <div>
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={recipe.nutrition.protein}
                onChange={(e) => handleNutritionChange('protein', e.target.value)}
                className="border-orange-200 focus:border-orange-400"
              />
            </div>
            <div>
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                  id="carbs"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={recipe.nutrition.carbs}
                  onChange={(e) => handleNutritionChange('carbs', e.target.value)}
                  className="border-orange-200 focus:border-orange-400"
                />
            </div>
            <div>
              <Label htmlFor="fat">Fat (g)</Label>
              <Input
                  id="fat"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={recipe.nutrition.fat}
                  onChange={(e) => handleNutritionChange('fat', e.target.value)}
                  className="border-orange-200 focus:border-orange-400"
                />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ingredients */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Ingredients</CardTitle>
            <Button
              type="button"
              onClick={addIngredient}
              variant="outline"
              size="sm"
              className="border-orange-300 hover:bg-orange-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Ingredient
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recipe.ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-3 items-end">
                <div className="flex-1">
                  <Label htmlFor={`ingredient-${index}`}>Ingredient</Label>
                  <Input
                    id={`ingredient-${index}`}
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    placeholder="e.g., All-purpose flour"
                    className="border-orange-200 focus:border-orange-400"
                  />
                </div>
                <div className="w-24">
                  <Label htmlFor={`amount-${index}`}>Amount</Label>
                  <Input
                      id={`amount-${index}`}
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      min="0"
                      value={ingredient.amount}
                      onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                      className="border-orange-200 focus:border-orange-400"
                    />
                </div>
                <div className="w-24">
                  <Label htmlFor={`unit-${index}`}>Unit</Label>
                  <Input
                    id={`unit-${index}`}
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    placeholder="cups, tsp..."
                    className="border-orange-200 focus:border-orange-400"
                  />
                </div>
                {recipe.ingredients.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    variant="outline"
                    size="icon"
                    className="border-red-200 hover:bg-red-50 text-red-600"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Instructions</CardTitle>
            <Button
              type="button"
              onClick={addInstruction}
              variant="outline"
              size="sm"
              className="border-orange-300 hover:bg-orange-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Step
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recipe.instructions.map((instruction, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm mt-2">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <Textarea
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    placeholder={`Step ${index + 1}: Describe what to do...`}
                    className="border-orange-200 focus:border-orange-400 h-20"
                  />
                </div>
                {recipe.instructions.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeInstruction(index)}
                    variant="outline"
                    size="icon"
                    className="border-red-200 hover:bg-red-50 text-red-600 mt-2"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || !recipe.title || recipe.ingredients.length === 0}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Saving...
            </>
          ) : (
            <>
              <SubmitIcon className="w-4 h-4 mr-2" />
              {submitButtonText}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}