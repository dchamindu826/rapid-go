import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const readClientConfig = {
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  token: import.meta.env.VITE_SANITY_TOKEN, // Viewer token for reading data
  useCdn: false,
  apiVersion: '2023-05-03',
  ignoreBrowserTokenWarning: false,
};

// Main client for reading data (used on most pages)
export const client = createClient(readClientConfig);

// A separate, secure client ONLY for writing data
export const writeClient = createClient({
  ...readClientConfig,
  token: import.meta.env.VITE_SANITY_WRITE_TOKEN, // Editor token for creating orders
});


const builder = imageUrlBuilder(client);
export const urlFor = (source) => builder.image(source);