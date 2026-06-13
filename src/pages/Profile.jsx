import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { deleteUserAccount } from "@/functions/deleteUserAccount";
import { Save, User, Mail, Settings, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import MobileSelect from "@/components/ui/mobile-select";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState({
    dietary_restrictions: [],
    allergies: [],
    default_servings: 4,
    favorite_cuisines: [],
    cooking_skill_level: "intermediate",
    notes: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dietaryInput, setDietaryInput] = useState("");
  const [allergyInput, setAllergyInput] = useState("");
  const [cuisineInput, setCuisineInput] = useState("");

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setIsLoading(true);
    const userData = await base44.auth.me();
    setUser(userData);
    
    if (userData.preferences) {
      setPreferences(userData.preferences);
    }
    setIsLoading(false);
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    await base44.auth.updateMe({ preferences });
    setIsSaving(false);
  };

  const addDietaryRestriction = () => {
    if (dietaryInput.trim() && !preferences.dietary_restrictions.includes(dietaryInput.trim())) {
      setPreferences({
        ...preferences,
        dietary_restrictions: [...preferences.dietary_restrictions, dietaryInput.trim()]
      });
      setDietaryInput("");
    }
  };

  const removeDietaryRestriction = (item) => {
    setPreferences({
      ...preferences,
      dietary_restrictions: preferences.dietary_restrictions.filter(d => d !== item)
    });
  };

  const addAllergy = () => {
    if (allergyInput.trim() && !preferences.allergies.includes(allergyInput.trim())) {
      setPreferences({
        ...preferences,
        allergies: [...preferences.allergies, allergyInput.trim()]
      });
      setAllergyInput("");
    }
  };

  const removeAllergy = (item) => {
    setPreferences({
      ...preferences,
      allergies: preferences.allergies.filter(a => a !== item)
    });
  };

  const addCuisine = () => {
    if (cuisineInput.trim() && !preferences.favorite_cuisines.includes(cuisineInput.trim())) {
      setPreferences({
        ...preferences,
        favorite_cuisines: [...preferences.favorite_cuisines, cuisineInput.trim()]
      });
      setCuisineInput("");
    }
  };

  const removeCuisine = (item) => {
    setPreferences({
      ...preferences,
      favorite_cuisines: preferences.favorite_cuisines.filter(c => c !== item)
    });
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Use backend function for reliable cascade delete
      await deleteUserAccount();
      // Then logout
      await base44.auth.logout("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-8"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-base text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* User Info Card */}
        <Card className="mb-6 border-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-orange-600" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <div className="mt-1 text-lg font-medium">{user?.full_name}</div>
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <div className="mt-1 text-lg">{user?.email}</div>
            </div>
            <div>
              <Label>Role</Label>
              <Badge className="mt-1 bg-orange-100 text-orange-800">
                {user?.role}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Preferences Card */}
        <Card className="border-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-orange-600" />
              Cooking Preferences
            </CardTitle>
            <CardDescription>
              Customize your recipe experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Default Servings */}
            <div>
              <Label>Default Servings</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={preferences.default_servings}
                onChange={(e) => setPreferences({
                  ...preferences,
                  default_servings: parseInt(e.target.value) || 4
                })}
                className="mt-2 max-w-xs"
              />
            </div>

            {/* Cooking Skill Level */}
            <div>
              <Label>Cooking Skill Level</Label>
              <div className="mt-2 max-w-xs">
                <MobileSelect
                  value={preferences.cooking_skill_level}
                  onValueChange={(value) => setPreferences({
                    ...preferences,
                    cooking_skill_level: value
                  })}
                  options={[
                    { value: "beginner", label: "Beginner" },
                    { value: "intermediate", label: "Intermediate" },
                    { value: "advanced", label: "Advanced" },
                    { value: "expert", label: "Expert" }
                  ]}
                  placeholder="Select skill level"
                  className="w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div>
              <Label>Dietary Restrictions</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="e.g., Vegetarian, Vegan, Keto"
                  value={dietaryInput}
                  onChange={(e) => setDietaryInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addDietaryRestriction()}
                />
                <Button onClick={addDietaryRestriction}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {preferences.dietary_restrictions.map((item, index) => (
                  <Badge
                    key={index}
                    className="bg-green-100 text-green-800 cursor-pointer"
                    onClick={() => removeDietaryRestriction(item)}
                  >
                    {item} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div>
              <Label>Allergies</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="e.g., Nuts, Dairy, Shellfish"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                />
                <Button onClick={addAllergy}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {preferences.allergies.map((item, index) => (
                  <Badge
                    key={index}
                    className="bg-red-100 text-red-800 cursor-pointer"
                    onClick={() => removeAllergy(item)}
                  >
                    {item} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* Favorite Cuisines */}
            <div>
              <Label>Favorite Cuisines</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="e.g., Italian, Thai, Mexican"
                  value={cuisineInput}
                  onChange={(e) => setCuisineInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCuisine()}
                />
                <Button onClick={addCuisine}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {preferences.favorite_cuisines.map((item, index) => (
                  <Badge
                    key={index}
                    className="bg-blue-100 text-blue-800 cursor-pointer"
                    onClick={() => removeCuisine(item)}
                  >
                    {item} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>Notes</Label>
              <Textarea
                placeholder="Any additional preferences or notes..."
                value={preferences.notes}
                onChange={(e) => setPreferences({
                  ...preferences,
                  notes: e.target.value
                })}
                className="mt-2 h-32"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSavePreferences}
                disabled={isSaving}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 mt-6">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible account actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. Your account and all associated data will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="bg-red-50 border border-red-200 rounded p-3 text-base text-red-800">
                  ⚠️ This will permanently delete your account, recipes, meal plans, and shopping lists.
                </div>
                <div className="flex gap-3">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? "Deleting..." : "Delete Account"}
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}