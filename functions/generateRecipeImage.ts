import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { recipeId, recipeName, description } = await req.json();

    // Generate image
    const imageResult = await base44.integrations.Core.GenerateImage({
      prompt: `Professional food photography of ${recipeName}. ${description}. Served in a white bowl or plate with garnish. Warm lighting, appetizing presentation, restaurant quality photography`,
    });

    // Update recipe with new image URL
    await base44.asServiceRole.entities.Recipe.update(recipeId, {
      image_url: imageResult.url
    });

    return Response.json({ 
      success: true, 
      imageUrl: imageResult.url 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});