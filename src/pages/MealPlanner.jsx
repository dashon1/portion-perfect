import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Plus, ShoppingCart } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import MealPlanCard from "../components/mealplan/MealPlanCard";
import AddMealDialog from "../components/mealplan/AddMealDialog";

export default function MealPlannerPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: mealPlans = [], isLoading } = useQuery({
    queryKey: ['mealPlans', currentWeekStart],
    queryFn: async () => {
      const weekEnd = addDays(currentWeekStart, 6);
      const plans = await base44.entities.MealPlan.list();
      return plans.filter(plan => {
        const planDate = new Date(plan.date);
        return planDate >= currentWeekStart && planDate <= weekEnd;
      });
    }
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list()
  });

  const createMealPlanMutation = useMutation({
    mutationFn: (data) => base44.entities.MealPlan.create(data),
    onMutate: async (newMeal) => {
      await queryClient.cancelQueries({ queryKey: ['mealPlans', currentWeekStart] });
      const previous = queryClient.getQueryData(['mealPlans', currentWeekStart]);
      queryClient.setQueryData(['mealPlans', currentWeekStart], (old) => [
        { id: `temp-${Date.now()}`, ...newMeal },
        ...(old || [])
      ]);
      return { previous };
    },
    onError: (err, newMeal, context) => {
      queryClient.setQueryData(['mealPlans', currentWeekStart], context.previous);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
    }
  });

  const deleteMealPlanMutation = useMutation({
    mutationFn: (id) => base44.entities.MealPlan.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['mealPlans'] });
      const previous = queryClient.getQueryData(['mealPlans', currentWeekStart]);
      queryClient.setQueryData(['mealPlans', currentWeekStart], (old) =>
        old?.filter(plan => plan.id !== id) || []
      );
      return { previous };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['mealPlans', currentWeekStart], context.previous);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
    }
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  const getMealsForDateAndType = (date, mealType) => {
    return mealPlans.filter(plan => 
      isSameDay(new Date(plan.date), date) && plan.meal_type === mealType
    );
  };

  const handleAddMeal = (date, mealType) => {
    setSelectedDate(date);
    setSelectedMealType(mealType);
    setIsAddDialogOpen(true);
  };

  const handleGenerateShoppingList = async () => {
    const recipeIds = [...new Set(mealPlans.map(plan => plan.recipe_id))];
    const ingredientsMap = {};

    for (const recipeId of recipeIds) {
      const recipe = recipes.find(r => r.id === recipeId);
      if (!recipe) continue;

      const plansForRecipe = mealPlans.filter(p => p.recipe_id === recipeId);
      const totalServings = plansForRecipe.reduce((sum, p) => sum + (p.servings || 1), 0);
      const scalingFactor = totalServings / recipe.original_servings;

      recipe.ingredients?.forEach(ing => {
        const key = `${ing.name}_${ing.unit}`;
        if (!ingredientsMap[key]) {
          ingredientsMap[key] = {
            ingredient: ing.name,
            amount: 0,
            unit: ing.unit,
            checked: false,
            recipe_ids: []
          };
        }
        ingredientsMap[key].amount += ing.amount * scalingFactor;
        ingredientsMap[key].recipe_ids.push(recipeId);
      });
    }

    const items = Object.values(ingredientsMap);
    
    await base44.entities.ShoppingList.create({
      name: `Shopping List - Week of ${format(currentWeekStart, 'MMM d')}`,
      items: items,
      created_for_date: format(currentWeekStart, 'yyyy-MM-dd')
    });

    navigate(createPageUrl('ShoppingLists'));
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Meal Planner</h1>
            <p className="text-base text-gray-600">Plan your meals for the week</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleGenerateShoppingList}
              disabled={mealPlans.length === 0}
              variant="outline"
              className="border-green-300 hover:bg-green-50 text-green-700"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Generate Shopping List
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                Week of {format(currentWeekStart, 'MMMM d, yyyy')}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
                >
                  ← Previous Week
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
                >
                  Next Week →
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-200 p-3 bg-gray-50 w-32">Meal</th>
                    {weekDays.map((day) => (
                      <th key={day.toString()} className="border border-gray-200 p-3 bg-gray-50">
                        <div className="text-center">
                          <div className="font-semibold">{format(day, 'EEE')}</div>
                          <div className="text-base text-gray-600">{format(day, 'MMM d')}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mealTypes.map((mealType) => (
                    <tr key={mealType}>
                      <td className="border border-gray-200 p-3 bg-gray-50 font-medium capitalize">
                        {mealType}
                      </td>
                      {weekDays.map((day) => {
                        const meals = getMealsForDateAndType(day, mealType);
                        return (
                          <td key={`${day}-${mealType}`} className="border border-gray-200 p-2 align-top">
                            <div className="min-h-24 space-y-2">
                              {meals.map((meal) => {
                                const recipe = recipes.find(r => r.id === meal.recipe_id);
                                return recipe ? (
                                  <MealPlanCard
                                    key={meal.id}
                                    meal={meal}
                                    recipe={recipe}
                                    onDelete={() => deleteMealPlanMutation.mutate(meal.id)}
                                  />
                                ) : null;
                              })}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAddMeal(day, mealType)}
                                className="w-full border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {isAddDialogOpen && (
        <AddMealDialog
          date={selectedDate}
          mealType={selectedMealType}
          recipes={recipes}
          onClose={() => setIsAddDialogOpen(false)}
          onSuccess={(mealData) => {
            createMealPlanMutation.mutate(mealData);
            setIsAddDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}