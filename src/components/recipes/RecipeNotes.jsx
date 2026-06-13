import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StickyNote, Save, Edit2 } from "lucide-react";

export default function RecipeNotes({ notes, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentNotes, setCurrentNotes] = useState(notes || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(currentNotes);
    setIsSaving(false);
    setIsEditing(false);
  };

  return (
    <Card className="border-purple-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-800 text-lg">
            <StickyNote className="w-5 h-5 text-purple-500" />
            My Notes & Variations
          </CardTitle>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="border-purple-300 hover:bg-purple-50"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={currentNotes}
              onChange={(e) => setCurrentNotes(e.target.value)}
              placeholder="Add your personal notes, variations, or cooking tips..."
              className="h-32 border-purple-200 focus:border-purple-400"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentNotes(notes || "");
                  setIsEditing(false);
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-purple-500 hover:bg-purple-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Notes'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-gray-700 whitespace-pre-wrap">
            {notes || (
              <p className="text-gray-400 italic">
                No notes yet. Click "Edit" to add your cooking tips and variations!
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}