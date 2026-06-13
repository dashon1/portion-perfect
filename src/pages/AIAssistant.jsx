import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Lightbulb, ChefHat } from "lucide-react";
import AIRecipeAssistant from "../components/recipes/AIRecipeAssistant";

export default function AIAssistantPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-indigo-500" />
            AI Recipe Assistant
          </h1>
          <p className="text-base text-gray-600">Get creative recipe ideas based on ingredients you have</p>
        </div>

        <div className="grid gap-6 mb-8">
          <AIRecipeAssistant />
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Lightbulb className="w-5 h-5 text-blue-500" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-base text-gray-700">
                <p><strong>1.</strong> Enter the ingredients you have available in your kitchen</p>
                <p><strong>2.</strong> Our AI will suggest creative recipe ideas you can make</p>
                <p><strong>3.</strong> Get difficulty levels, cooking times, and additional ingredients needed</p>
                <p><strong>4.</strong> Use the suggestions to create new recipes or find inspiration</p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <ChefHat className="w-5 h-5 text-purple-500" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-base text-gray-700">
                <p>✨ Be specific with ingredient names (e.g., "chicken breast" instead of just "chicken")</p>
                <p>✨ Include proteins, vegetables, and pantry staples for better suggestions</p>
                <p>✨ Try different combinations to discover new favorite recipes</p>
                <p>✨ The more ingredients you provide, the more creative the suggestions</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}