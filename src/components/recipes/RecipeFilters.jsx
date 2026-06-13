import React from "react";
import { Filter } from "lucide-react";
import MobileSelect from "@/components/ui/mobile-select";

const categories = [
  { value: "all", label: "All Categories" },
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

export default function RecipeFilters({ selectedCategory, onCategoryChange }) {
  return (
    <div className="flex items-center gap-2">
      <Filter className="w-4 h-4 text-gray-500" />
      <MobileSelect 
        value={selectedCategory} 
        onValueChange={onCategoryChange}
        options={categories}
        placeholder="Filter by category"
        className="w-48 border-orange-200 focus:border-orange-400 rounded-xl dark:bg-slate-800 dark:text-white dark:border-orange-700"
      />
    </div>
  );
}