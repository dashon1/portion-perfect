import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MealPlanCard({ meal, recipe, onDelete }) {
  return (
    <div className="bg-white rounded-lg border border-orange-200 p-2 shadow-sm hover:shadow-md transition-shadow group relative">
      <Link to={createPageUrl(`RecipeDetail?id=${recipe.id}`)} className="block">
        <p className="font-medium text-base text-gray-900 line-clamp-2 mb-1 group-hover:text-orange-600">
          {recipe.title}
        </p>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Users className="w-3 h-3" />
          <span>{meal.servings} servings</span>
        </div>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute -top-2 -right-2 min-h-[44px] min-w-[44px] h-11 w-11 rounded-full bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity flex items-center justify-center"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}