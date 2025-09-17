import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const client = createClient({
  // අපි Vercel වල හදපු Environment Variables මෙතනට දානවා
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,

  // අද දිනය හෝ ඔයා project එක හදපු දිනයක් YYYY-MM-DD විදිහට දෙන්න
  apiVersion: '2025-09-17', 
  
  // Public data කියවද්දී CDN එක use කරන එක වේගවත්
  useCdn: true, 
});

const builder = imageUrlBuilder(client);

export const urlFor = (source) => builder.image(source);