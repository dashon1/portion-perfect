import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Clock, Search, Heart, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RecipeCard from "../components/recipes/RecipeCard";
import RecipeFilters from "../components/recipes/RecipeFilters";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [maxCookTime, setMaxCookTime] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecipes();
  }, []);

  useEffect(() => {
    let filtered = recipes;

    if (showFavoritesOnly) {
      filtered = filtered.filter(recipe => recipe.is_favorite);
    }

    if (searchTerm) {
      filtered = filtered.filter(recipe => 
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.cuisine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        recipe.ingredients?.some(ing => ing.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(recipe => recipe.category === selectedCategory);
    }

    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(recipe => recipe.difficulty === selectedDifficulty);
    }

    if (maxCookTime) {
      filtered = filtered.filter(recipe => {
        const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
        return totalTime <= parseInt(maxCookTime);
      });
    }

    setFilteredRecipes(filtered);
  }, [recipes, searchTerm, selectedCategory, showFavoritesOnly, maxCookTime, selectedDifficulty]);

  const handleToggleFavorite = async (recipe) => {
    // Optimistic update
    const updatedRecipes = recipes.map(r => 
      r.id === recipe.id ? { ...r, is_favorite: !r.is_favorite } : r
    );
    setRecipes(updatedRecipes);
    
    // Persist to database
    await base44.entities.Recipe.update(recipe.id, { 
      ...recipe, 
      is_favorite: !recipe.is_favorite 
    });
  };

  const loadRecipes = async () => {
    setIsLoading(true);
    const data = await base44.entities.Recipe.list("-created_date");
    setRecipes(data);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Recipe Collection</h1>
            <p className="text-base text-gray-600">Scale any recipe to perfection</p>
          </div>
          <Link to={createPageUrl("AddRecipe")}>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="w-5 h-5 mr-2" />
              Add New Recipe
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by recipe name, cuisine, ingredients, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-orange-200 focus:border-orange-400 rounded-xl dark:bg-slate-800 dark:text-white dark:border-orange-700"
              />
            </div>
            <RecipeFilters 
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-40 border-orange-200 dark:bg-slate-800 dark:text-white dark:border-orange-700">
                   <SelectValue placeholder="Difficulty" />
                 </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulty</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <Input
                type="number"
                inputMode="numeric"
                placeholder="Max cooking time (min)"
                value={maxCookTime}
                onChange={(e) => setMaxCookTime(e.target.value)}
                className="w-48 border-orange-200 dark:bg-slate-800 dark:text-white dark:border-orange-700"
              />
            </div>

            {(selectedDifficulty !== "all" || maxCookTime) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDifficulty("all");
                  setMaxCookTime("");
                }}
                className="border-orange-200"
              >
                Clear Filters
              </Button>
            )}
          </div>
          <Tabs value={showFavoritesOnly ? "favorites" : "all"} onValueChange={(v) => setShowFavoritesOnly(v === "favorites")}>
            <TabsList className="border border-orange-200 dark:bg-slate-800 dark:border-orange-700">
              <TabsTrigger value="all" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:text-gray-300">
                All Recipes ({recipes.length})
              </TabsTrigger>
              <TabsTrigger value="favorites" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white dark:text-gray-300">
                <Heart className="w-4 h-4 mr-2" />
                Favorites ({recipes.filter(r => r.is_favorite).length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Recipe Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl p-6 shadow-sm animate-pulse dark:bg-slate-800 bg-white">
                 <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
                 <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                 <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
                 <div className="flex gap-2">
                   <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                   <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                 </div>
               </div>
            ))}
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
              <Clock className="w-12 h-12 text-orange-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {recipes.length === 0 ? "No recipes yet!" : "No recipes found"}
            </h3>
            <p className="text-base text-gray-600 mb-6 max-w-md mx-auto">
              {recipes.length === 0 
                ? "Start building your recipe collection by adding your first recipe."
                : "Try adjusting your search or filters to find what you're looking for."
              }
            </p>
            {recipes.length === 0 && (
              <Link to={createPageUrl("AddRecipe")}>
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Recipe
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max overscroll-contain">
              {filteredRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} onToggleFavorite={handleToggleFavorite} />
              ))}
            </div>
        )}
      </div>
    </div>
  );
}