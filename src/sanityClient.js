    import { createClient } from '@sanity/client';
    import imageUrlBuilder from '@sanity/image-url';

    export const client = createClient({
      projectId: 'p0umau0m', // Oyaage Sanity Project ID eka
      dataset: 'production',
      apiVersion: '2024-09-17',
      token: import.meta.env.VITE_SANITY_TOKEN, // .env file eken token eka gannawa
      useCdn: false,
    });

    const builder = imageUrlBuilder(client);

    export const urlFor = (source) => builder.image(source);
  