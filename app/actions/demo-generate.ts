'use server';

import { generateSiteContent } from '@/lib/ai';

// NOTE: This action is no longer used for the landing page demo.
// The demo now uses prebuilt JSON content files in public/demo-content/.
// This action is kept for potential future use or other demo scenarios.

export async function generateDemoSite(prompt: string) {
  try {
    // Generate site content using the existing AI function
    // Use 'dev' template and 'editorial' aesthetic for the demo
    const content = await generateSiteContent(prompt, 'dev', 'editorial');
    
    return { success: true, content };
  } catch (error: any) {
    console.error('Error generating demo site:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to generate demo site' 
    };
  }
}
