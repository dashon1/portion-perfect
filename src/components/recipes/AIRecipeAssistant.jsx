import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2 } from "lucide-react";

export default function AIRecipeAssistant() {
  const [ingredients, setIngredients] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetSuggestions = async () => {
    if (!ingredients.trim()) return;

    setIsLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `I have these ingredients: ${ingredients}. 
        
        Please suggest 3 creative recipe ideas I can make with these ingredients. 
        For each recipe, provide:
        - Recipe name
        - Brief description
        - Difficulty level (easy/medium/hard)
        - Estimated cooking time
        - Key additional ingredients needed (if any)
        
        Format the response in a clear, friendly way.`,
        response_json_schema: {
          type: "object",
          properties: {
            recipes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  difficulty: { type: "string" },
                  time: { type: "string" },
                  additional_ingredients: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setSuggestions(response);
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
    }
    setIsLoading(false);
  };

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-900">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          AI Recipe Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="Enter ingredients you have available (e.g., chicken, tomatoes, pasta, garlic...)"
            className="h-24 border-indigo-200 focus:border-indigo-400"
          />
        </div>
        <Button
          onClick={handleGetSuggestions}
          disabled={isLoading || !ingredients.trim()}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Getting Suggestions...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Get Recipe Suggestions
            </>
          )}
        </Button>

        {suggestions && suggestions.recipes && (
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold text-indigo-900">AI Suggestions:</h3>
            {suggestions.recipes.map((recipe, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-indigo-200">
                <h4 className="font-bold text-lg text-gray-900 mb-2">{recipe.name}</h4>
                <p className="text-gray-700 text-sm mb-2">{recipe.description}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                    {recipe.difficulty}
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    ⏱️ {recipe.time}
                  </span>
                </div>
                {recipe.additional_ingredients && recipe.additional_ingredients.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 font-medium">Also need:</p>
                    <p className="text-xs text-gray-600">{recipe.additional_ingredients.join(", ")}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}