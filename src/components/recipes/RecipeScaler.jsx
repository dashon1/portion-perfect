import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Scale } from "lucide-react";

export default function RecipeScaler({ originalServings, currentServings, onServingsChange }) {
  const scalingFactor = currentServings / originalServings;

  const adjustServings = (change) => {
    const newServings = Math.max(1, currentServings + change);
    onServingsChange(newServings);
  };

  const handleDirectInput = (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    onServingsChange(value);
  };

  return (
    <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Scale className="w-5 h-5" />
          Recipe Scaler
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="font-medium text-gray-700">Servings:</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustServings(-1)}
                disabled={currentServings <= 1}
                className="h-10 w-10 border-orange-300 hover:bg-orange-100"
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <Input
                type="number"
                min="1"
                value={currentServings}
                onChange={handleDirectInput}
                className="w-20 text-center font-bold text-lg border-orange-300 focus:border-orange-500"
              />
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustServings(1)}
                className="h-10 w-10 border-orange-300 hover:bg-orange-100"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="text-center">
              <div className="font-medium text-orange-700">Scaling Factor</div>
              <div className="text-2xl font-bold text-orange-600">
                {scalingFactor.toFixed(2)}x
              </div>
            </div>
            
            {scalingFactor !== 1 && (
              <div className="text-center">
                <div className="font-medium">Original</div>
                <div className="text-lg">{originalServings} servings</div>
              </div>
            )}
          </div>

          {scalingFactor !== 1 && (
            <Button
              variant="outline"
              onClick={() => onServingsChange(originalServings)}
              className="border-orange-300 hover:bg-orange-100 text-orange-700"
            >
              Reset to Original
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}