import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MobileRecipeHeader({ title, onBack }) {
  const navigate = useNavigate();

  return (
    <div className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-orange-100 px-4 py-3" style={{paddingTop: 'calc(0.75rem + env(safe-area-inset-top))'}}>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="hover:bg-orange-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold text-gray-900 truncate">
          {title}
        </h1>
      </div>
    </div>
  );
}