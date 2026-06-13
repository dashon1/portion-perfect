import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChefHat, Home, Plus, BookOpen, Calendar, ShoppingCart, BarChart3, Sparkles, User, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "My Recipes",
    url: createPageUrl("Recipes"),
    icon: Home,
  },
  {
    title: "Add Recipe",
    url: createPageUrl("AddRecipe"),
    icon: Plus,
  },
  {
    title: "Meal Planner",
    url: createPageUrl("MealPlanner"),
    icon: Calendar,
  },
  {
    title: "Shopping Lists",
    url: createPageUrl("ShoppingLists"),
    icon: ShoppingCart,
  },
  {
    title: "Analytics",
    url: createPageUrl("Dashboard"),
    icon: BarChart3,
  },
  {
    title: "AI Assistant",
    url: createPageUrl("AIAssistant"),
    icon: Sparkles,
  },
  {
    title: "My Profile",
    url: createPageUrl("Profile"),
    icon: User,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Recipes");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [openSelect, setOpenSelect] = useState(null);
  const [tabScrollPositions, setTabScrollPositions] = useState({});
  const touchStartY = useRef(0);
  const scrollAreaRef = useRef(null);
  const queryClient = useQueryClient();

  // Detect and track page changes
  useEffect(() => {
    const pathSegments = location.pathname.split("/");
    const page = pathSegments[pathSegments.length - 1] || "Recipes";
    setActiveTab(page);
    
    // Restore scroll position when switching to this tab
    if (scrollAreaRef.current && tabScrollPositions[page] !== undefined) {
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = tabScrollPositions[page];
        }
      }, 0);
    }
  }, [location.pathname, tabScrollPositions]);

  // Save scroll position when switching tabs
  const handleTabChange = (newTab) => {
    if (scrollAreaRef.current) {
      setTabScrollPositions(prev => ({
        ...prev,
        [activeTab]: scrollAreaRef.current.scrollTop
      }));
    }
  };

  // Handle tab reset when clicking active tab
  const handleTabClick = (tabName, tabUrl) => {
    if (activeTab === tabName) {
      // Reset to root and scroll to top
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = 0;
        setTabScrollPositions(prev => ({
          ...prev,
          [tabName]: 0
        }));
      }
      navigate(tabUrl, { replace: true });
    } else {
      // Switch to different tab - save current scroll position then navigate
      handleTabChange(tabName);
      navigate(tabUrl);
    }
  };

  // Handle pull-to-refresh
  const handleTouchStart = (e) => {
    if (scrollAreaRef.current && scrollAreaRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    } else {
      touchStartY.current = null;
    }
  };

  const handleTouchMove = (e) => {
    if (!scrollAreaRef.current || touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;

    if (scrollAreaRef.current.scrollTop === 0 && diff > 0) {
      // Apply resistance/spring effect - diminishing returns as you pull further
      const resistance = 0.5;
      const adjustedDiff = Math.pow(diff, resistance) * 2;
      setPullDistance(Math.min(adjustedDiff, 80));

      // Prevent default scroll behavior when pulling
      if (diff > 10) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 50) {
      setIsRefreshing(true);
      // Haptic feedback simulation via vibration API (if available)
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
      await queryClient.refetchQueries();
      setIsRefreshing(false);
    }
    // Animate back to 0 with spring effect
    setPullDistance(0);
  };

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --bg-light: #FFF8F0;
          --bg-light-end: #FFE4CC;
          --bg-dark: #1a1a1a;
          --bg-dark-end: #2d2d2d;
          --card-bg: #ffffff;
          --card-bg-dark: #1e293b;
          --text-primary: #111827;
          --text-primary-dark: #f9fafb;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --bg-light: var(--bg-dark);
            --bg-light-end: var(--bg-dark-end);
          }
          .bg-white { background-color: var(--card-bg-dark) !important; }
          .bg-slate-50, .bg-gray-50 { background-color: #0f172a !important; }
          .text-gray-900 { color: var(--text-primary-dark) !important; }
          .text-gray-600, .text-gray-700 { color: #d1d5db !important; }
          .border-orange-100, .border-orange-200 { border-color: #7c2d12 !important; }
        }
        button, a { -webkit-user-select: none; user-select: none; }
        *:focus-visible { outline: 2px solid #f97316; outline-offset: 2px; }
      `}</style>
      <div 
        className="min-h-screen flex w-full overscroll-none" 
        style={{
          background: 'linear-gradient(135deg, var(--bg-light) 0%, var(--bg-light-end) 100%)',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        <Sidebar className="border-r border-orange-100 bg-white/80 backdrop-blur-sm hidden md:flex overscroll-none select-none">
          <SidebarHeader className="border-b border-orange-100 p-6" style={{paddingTop: 'calc(1.5rem + env(safe-area-inset-top))'}}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">RecipeScaler</h2>
                <p className="text-sm text-orange-600">Perfect portions, every time</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2 select-none">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-orange-50 hover:text-orange-700 transition-all duration-200 rounded-xl py-3 ${
                          location.pathname === item.url ? 'bg-orange-100 text-orange-800 shadow-sm' : ''
                        }`}
                      >
                        <Link 
                          to={item.url} 
                          className="flex items-center gap-3 px-4"
                          onClick={() => handleTabChange(item.title)}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="hidden lg:block mt-8 mx-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold text-orange-900">Pro Tip</span>
              </div>
              <p className="text-sm text-orange-700 leading-relaxed">
                Save time by creating recipe templates for your most-cooked meals!
              </p>
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col w-full">
          <header className="bg-white/60 backdrop-blur-sm border-b border-orange-100 px-6 py-4 md:hidden" style={{paddingTop: 'calc(1rem + env(safe-area-inset-top))'}}>
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-orange-50 p-2 rounded-lg transition-colors duration-200 select-none" />
              <div className="flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-orange-600" />
                <h1 className="text-xl font-bold text-gray-900">RecipeScaler</h1>
              </div>
            </div>
          </header>

          <div 
            ref={scrollAreaRef}
            className="flex-1 overflow-auto pb-24 md:pb-0 relative overscroll-y-contain"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onScroll={() => {
              if (scrollAreaRef.current && location.pathname !== "") {
                setTabScrollPositions(prev => ({
                  ...prev,
                  [activeTab]: scrollAreaRef.current.scrollTop
                }));
              }
            }}
          >
            {/* Pull-to-Refresh indicator */}
              {(pullDistance > 0 || isRefreshing) && (
                <motion.div
                  className="fixed top-0 left-0 right-0 h-20 bg-gradient-to-b from-orange-100 to-transparent flex items-center justify-center z-10"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ 
                    opacity: isRefreshing ? 1 : Math.min(pullDistance / 50, 1),
                    y: isRefreshing ? 0 : Math.min(pullDistance * 0.5, 20)
                  }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  style={{ paddingTop: 'env(safe-area-inset-top)' }}
                >
                  <motion.div
                    animate={{ 
                      rotate: isRefreshing ? 360 : pullDistance * 4,
                      scale: isRefreshing ? 1 : Math.min(0.8 + (pullDistance / 100), 1)
                    }}
                    transition={{ 
                      rotate: { repeat: isRefreshing ? Infinity : 0, duration: 0.8, ease: "linear" },
                      scale: { type: "spring", stiffness: 200 }
                    }}
                    className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full"
                  />
                  {pullDistance > 50 && !isRefreshing && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="ml-2 text-sm text-orange-600 font-medium"
                    >
                      Release to refresh
                    </motion.span>
                  )}
                </motion.div>
              )}

            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile Bottom Navigation */}
          <nav 
            className="fixed bottom-0 left-0 right-0 md:hidden bg-white/90 backdrop-blur-md border-t border-orange-100 select-none"
            style={{paddingBottom: 'env(safe-area-inset-bottom)'}}
          >
            <div className="flex justify-around items-center h-16">
              {[
                    { title: "Recipes", url: createPageUrl("Recipes"), icon: Home },
                    { title: "MealPlanner", url: createPageUrl("MealPlanner"), icon: Calendar },
                    { title: "ShoppingLists", url: createPageUrl("ShoppingLists"), icon: ShoppingCart },
                    { title: "Profile", url: createPageUrl("Profile"), icon: User },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.title;
                    return (
                      <button
                        key={item.title}
                        onClick={() => handleTabClick(item.title, item.url)}
                        className={`flex flex-col items-center justify-center w-full h-full gap-1 text-sm font-medium transition-colors duration-200 ${
                          isActive 
                            ? 'text-orange-600 bg-orange-50' 
                            : 'text-gray-600 hover:text-orange-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="truncate px-1">{item.title === 'Recipes' ? 'Home' : item.title.split(/(?=[A-Z])/).join(' ').split(' ')[0]}</span>
                      </button>
                    );
                  })}
            </div>
          </nav>
        </main>
      </div>
    </SidebarProvider>
  );
}