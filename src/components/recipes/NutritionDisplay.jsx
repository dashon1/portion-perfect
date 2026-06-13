import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Flame, Beef, Wheat, Droplet } from "lucide-react";

export default function NutritionDisplay({ nutrition, scalingFactor = 1 }) {
  if (!nutrition || Object.keys(nutrition).length === 0) {
    return null;
  }

  const nutrients = [
    { 
      key: 'calories', 
      label: 'Calories', 
      icon: Flame, 
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      unit: 'kcal'
    },
    { 
      key: 'protein', 
      label: 'Protein', 
      icon: Beef, 
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      unit: 'g'
    },
    { 
      key: 'carbs', 
      label: 'Carbs', 
      icon: Wheat, 
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      unit: 'g'
    },
    { 
      key: 'fat', 
      label: 'Fat', 
      icon: Droplet, 
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      unit: 'g'
    }
  ];

  return (
    <Card className="border-orange-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-gray-800 text-lg">
          <Activity className="w-5 h-5 text-green-500" />
          Nutrition Per Serving
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {nutrients.map(({ key, label, icon: Icon, color, bgColor, unit }) => {
            const value = nutrition[key];
            if (value === undefined || value === null) return null;

            return (
              <div key={key} className={`${bgColor} rounded-lg p-4 text-center`}>
                <Icon className={`${color} w-6 h-6 mx-auto mb-2`} />
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(value * scalingFactor)}
                </div>
                <div className="text-xs text-gray-600 mt-1">{unit}</div>
                <div className="text-sm text-gray-700 font-medium mt-1">{label}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}