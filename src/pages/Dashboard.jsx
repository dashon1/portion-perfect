import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BookOpen, Star, Heart, Clock } from "lucide-react";

export default function DashboardPage() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);
    const handleChange = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list()
  });

  const totalRecipes = recipes.length;
  const favoriteRecipes = recipes.filter(r => r.is_favorite).length;
  const averageRating = recipes.length > 0
    ? recipes.filter(r => r.rating).reduce((sum, r) => sum + (r.rating || 0), 0) / recipes.filter(r => r.rating).length
    : 0;

  // Category distribution
  const categoryData = recipes.reduce((acc, recipe) => {
    const cat = recipe.category || 'other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value
  }));

  // Cuisine distribution
  const cuisineData = recipes.reduce((acc, recipe) => {
    const cuisine = recipe.cuisine || 'Other';
    acc[cuisine] = (acc[cuisine] || 0) + 1;
    return acc;
  }, {});

  const cuisineChartData = Object.entries(cuisineData)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Difficulty distribution
  const difficultyData = recipes.reduce((acc, recipe) => {
    const diff = recipe.difficulty || 'medium';
    acc[diff] = (acc[diff] || 0) + 1;
    return acc;
  }, {});

  const difficultyChartData = [
    { name: 'Easy', value: difficultyData.easy || 0, color: '#22c55e' },
    { name: 'Medium', value: difficultyData.medium || 0, color: '#f59e0b' },
    { name: 'Hard', value: difficultyData.hard || 0, color: '#ef4444' }
  ];

  const avgCookTime = recipes.length > 0
    ? recipes.reduce((sum, r) => sum + ((r.prep_time || 0) + (r.cook_time || 0)), 0) / recipes.length
    : 0;

  const COLORS = ['#f97316', '#ef4444', '#ec4899', '#a855f7', '#6366f1', '#3b82f6', '#06b6d4', '#10b981'];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Recipe Analytics</h1>
          <p className="text-base text-gray-600">Your cooking journey at a glance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700 font-medium">Total Recipes</p>
                  <p className="text-3xl font-bold text-orange-900 mt-1">{totalRecipes}</p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-50 to-red-50 border-pink-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-pink-700 font-medium">Favorites</p>
                  <p className="text-3xl font-bold text-pink-900 mt-1">{favoriteRecipes}</p>
                </div>
                <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 font-medium">Avg Rating</p>
                  <p className="text-3xl font-bold text-yellow-900 mt-1">
                    {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Avg Time</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">
                    {Math.round(avgCookTime)}m
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Recipe Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                       data={categoryChartData}
                       cx="50%"
                       cy="50%"
                       labelLine={false}
                       label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                       outerRadius={80}
                       fill="#8884d8"
                       dataKey="value"
                     >
                       {categoryChartData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <Tooltip contentStyle={{ backgroundColor: isDarkMode ? "#2d2d2d" : "#fff", border: `1px solid ${isDarkMode ? "#444" : "#e5e7eb"}`, color: isDarkMode ? "#fff" : "#000" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-12">No data yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top 5 Cuisines</CardTitle>
            </CardHeader>
            <CardContent>
              {cuisineChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                   <BarChart data={cuisineChartData}>
                     <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#444" : "#e5e7eb"} />
                     <XAxis dataKey="name" stroke={isDarkMode ? "#999" : "#666"} />
                     <YAxis stroke={isDarkMode ? "#999" : "#666"} />
                     <Tooltip contentStyle={{ backgroundColor: isDarkMode ? "#2d2d2d" : "#fff", border: `1px solid ${isDarkMode ? "#444" : "#e5e7eb"}`, color: isDarkMode ? "#fff" : "#000" }} />
                     <Bar dataKey="count" fill="#f97316" />
                   </BarChart>
                 </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-12">No data yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Difficulty Level Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {difficultyChartData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                       data={difficultyChartData}
                       cx="50%"
                       cy="50%"
                       labelLine={false}
                       label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                       outerRadius={80}
                       fill="#8884d8"
                       dataKey="value"
                     >
                       {difficultyChartData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                     </Pie>
                     <Tooltip contentStyle={{ backgroundColor: isDarkMode ? "#2d2d2d" : "#fff", border: `1px solid ${isDarkMode ? "#444" : "#e5e7eb"}`, color: isDarkMode ? "#fff" : "#000" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-12">No data yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className={`flex items-center justify-between p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Most Common Cuisine</span>
                  <span className={`font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {cuisineChartData[0]?.name || 'N/A'}
                  </span>
                </div>
                <div className={`flex items-center justify-between p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Quickest Recipe</span>
                  <span className={`font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {recipes.length > 0
                      ? Math.min(...recipes.map(r => (r.prep_time || 0) + (r.cook_time || 0)))
                      : 'N/A'}
                    {recipes.length > 0 && 'm'}
                  </span>
                </div>
                <div className={`flex items-center justify-between p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Most Time-Consuming</span>
                  <span className={`font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {recipes.length > 0
                      ? Math.max(...recipes.map(r => (r.prep_time || 0) + (r.cook_time || 0)))
                      : 'N/A'}
                    {recipes.length > 0 && 'm'}
                  </span>
                </div>
                <div className={`flex items-center justify-between p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Recipes with Ratings</span>
                  <span className={`font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {recipes.filter(r => r.rating).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}