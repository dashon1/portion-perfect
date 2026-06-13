import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send } from "lucide-react";

export default function RecipeAIAdvisor({ recipe }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAskAI = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    setAnswer("");

    try {
      const recipeContext = `
Recipe: ${recipe.title}
Description: ${recipe.description || "N/A"}
Servings: ${recipe.original_servings}
Ingredients: ${recipe.ingredients.map(ing => `${ing.amount} ${ing.unit} ${ing.name}`).join(", ")}
Instructions: ${recipe.instructions.join(" ")}
Category: ${recipe.category}
Cuisine: ${recipe.cuisine || "N/A"}
Difficulty: ${recipe.difficulty}
      `.trim();

      const prompt = `You are a helpful cooking assistant. Here's the recipe context:

${recipeContext}

User Question: ${question}

Please provide a helpful, practical answer. If they're asking about substitutions, suggest alternatives with ratios. If they want creative ideas, give specific suggestions. If they want to incorporate different ingredients, explain how to adapt the recipe.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      setAnswer(response);
    } catch (error) {
      setAnswer("Sorry, I couldn't process your question. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const exampleQuestions = [
    "What can I substitute for vanilla extract?",
    "I don't have chocolate chips, what else can I use?",
    "How can I make this recipe healthier?",
    "Can I add rosemary to this recipe?",
    "What wine pairs well with this dish?"
  ];

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Recipe AI Assistant
        </CardTitle>
        <p className="text-sm text-purple-700">
          Ask questions about substitutions, modifications, or creative ideas for this recipe
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            placeholder="e.g., What can I use instead of eggs? or I have chicken breast instead of thighs, how do I adjust?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-24 bg-white border-purple-200 focus:border-purple-400"
            disabled={isLoading}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-purple-600 font-medium">Quick examples:</span>
          {exampleQuestions.slice(0, 3).map((q, idx) => (
            <button
              key={idx}
              onClick={() => setQuestion(q)}
              className="text-xs px-2 py-1 bg-white border border-purple-200 rounded-full hover:bg-purple-100 transition-colors"
              disabled={isLoading}
            >
              {q}
            </button>
          ))}
        </div>

        <Button
          onClick={handleAskAI}
          disabled={isLoading || !question.trim()}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Thinking...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Ask AI
            </>
          )}
        </Button>

        {answer && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Answer:
            </h4>
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {answer}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}