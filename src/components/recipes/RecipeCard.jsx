import React, { memo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Clock, Users, ChefHat, Heart, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const categoryColors = {
  appetizer: "bg-green-100 text-green-800",
  main_course: "bg-blue-100 text-blue-800", 
  dessert: "bg-pink-100 text-pink-800",
  side_dish: "bg-yellow-100 text-yellow-800",
  beverage: "bg-purple-100 text-purple-800",
  breakfast: "bg-orange-100 text-orange-800",
  lunch: "bg-teal-100 text-teal-800",
  dinner: "bg-indigo-100 text-indigo-800",
  snack: "bg-red-100 text-red-800"
};

const RecipeCard = memo(function RecipeCard({ recipe, onToggleFavorite }) {
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(recipe);
    }
  };

  return (
    <Link to={createPageUrl(`RecipeDetail?id=${recipe.id}`)} className="h-full">
      <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border-orange-100 dark:border-orange-900 hover:border-orange-200 dark:hover:border-orange-700 relative h-full flex flex-col">
        {recipe.is_favorite && (
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={handleFavoriteClick}
              className="bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
            >
              <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
            </button>
          </div>
        )}
        {!recipe.is_favorite && (
          <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleFavoriteClick}
              className="bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
            >
              <Heart className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-pink-500" />
            </button>
          </div>
        )}
        <div className="relative w-full h-40 flex-shrink-0 overflow-hidden">
          {recipe.image_url ? (
            <img 
              src={recipe.image_url} 
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-200 to-red-200 flex items-center justify-center">
              <ChefHat className="w-16 h-16 text-orange-500" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
              {recipe.title}
            </h3>
            <Badge className={`${categoryColors[recipe.category]} border-0 text-sm font-medium ml-2 flex-shrink-0`}>
              {recipe.category?.replace('_', ' ')}
            </Badge>
          </div>
          
          {recipe.description && (
            <p className="text-gray-600 dark:text-gray-400 text-base mb-4 line-clamp-2">
              {recipe.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-base text-gray-500 dark:text-gray-400 mt-auto pt-3">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{recipe.original_servings} servings</span>
            </div>
            {totalTime > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{totalTime}m</span>
              </div>
            )}
          </div>

          {recipe.rating && (
            <div className="flex items-center gap-1 mt-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-base font-medium text-gray-700 dark:text-gray-300">{recipe.rating.toFixed(1)}</span>
            </div>
          )}
          
          {recipe.cuisine && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="text-sm text-orange-600 dark:text-orange-400 font-medium bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                {recipe.cuisine}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
});

export default RecipeCard;