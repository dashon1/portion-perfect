import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default function InstructionsList({ instructions, scalingFactor }) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <BookOpen className="w-5 h-5 text-orange-500" />
          Instructions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {instructions.map((instruction, index) => (
            <div 
              key={index}
              className="flex gap-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              <p className="text-gray-700 leading-relaxed pt-1">
                {instruction}
              </p>
            </div>
          ))}
          
          {instructions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No instructions provided for this recipe.
            </div>
          )}
        </div>

        {scalingFactor !== 1 && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-700">
              <strong>Note:</strong> You've scaled this recipe by {scalingFactor.toFixed(2)}x. 
              Cooking times may need slight adjustments for best results.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}