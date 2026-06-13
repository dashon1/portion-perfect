import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

const formatAmount = (amount, scalingFactor) => {
  const scaledAmount = amount * scalingFactor;
  
  // Handle fractions nicely
  if (scaledAmount < 1) {
    const fraction = scaledAmount;
    if (Math.abs(fraction - 0.25) < 0.01) return "¼";
    if (Math.abs(fraction - 0.33) < 0.01) return "⅓";
    if (Math.abs(fraction - 0.5) < 0.01) return "½";
    if (Math.abs(fraction - 0.67) < 0.01) return "⅔";
    if (Math.abs(fraction - 0.75) < 0.01) return "¾";
    return fraction.toFixed(2);
  }
  
  // For larger amounts, show as mixed numbers when appropriate
  const wholePart = Math.floor(scaledAmount);
  const fractionalPart = scaledAmount - wholePart;
  
  if (fractionalPart < 0.01) {
    return wholePart.toString();
  }
  
  if (Math.abs(fractionalPart - 0.25) < 0.01) return `${wholePart}¼`;
  if (Math.abs(fractionalPart - 0.33) < 0.01) return `${wholePart}⅓`;
  if (Math.abs(fractionalPart - 0.5) < 0.01) return `${wholePart}½`;
  if (Math.abs(fractionalPart - 0.67) < 0.01) return `${wholePart}⅔`;
  if (Math.abs(fractionalPart - 0.75) < 0.01) return `${wholePart}¾`;
  
  return scaledAmount.toFixed(2);
};

export default function IngredientsList({ ingredients, scalingFactor }) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <ShoppingCart className="w-5 h-5 text-orange-500" />
          Ingredients
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {ingredients.map((ingredient, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <span className="font-medium text-gray-900">
                  {ingredient.name}
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold text-orange-600 text-lg">
                  {formatAmount(ingredient.amount, scalingFactor)}
                </span>
                {ingredient.unit && (
                  <span className="text-gray-600 ml-1">
                    {ingredient.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
          
          {ingredients.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No ingredients listed for this recipe.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}