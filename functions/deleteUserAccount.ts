import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.email;

    // Use service role for reliable batch deletion
    // Delete all recipes created by this user
    const recipes = await base44.asServiceRole.entities.Recipe.filter({ created_by: userEmail });
    if (recipes.length > 0) {
      await Promise.all(recipes.map(r => base44.asServiceRole.entities.Recipe.delete(r.id)));
    }

    // Delete all meal plans created by this user
    const mealPlans = await base44.asServiceRole.entities.MealPlan.filter({ created_by: userEmail });
    if (mealPlans.length > 0) {
      await Promise.all(mealPlans.map(p => base44.asServiceRole.entities.MealPlan.delete(p.id)));
    }

    // Delete all shopping lists created by this user
    const shoppingLists = await base44.asServiceRole.entities.ShoppingList.filter({ created_by: userEmail });
    if (shoppingLists.length > 0) {
      await Promise.all(shoppingLists.map(l => base44.asServiceRole.entities.ShoppingList.delete(l.id)));
    }

    return Response.json({ success: true, message: 'All user data deleted successfully' });
  } catch (error) {
    console.error('Error deleting user data:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});