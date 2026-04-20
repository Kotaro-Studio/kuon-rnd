import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/mypage',
          '/auth/',
          '/api/',
          '/shop/thanks',
          '/proposal-catone',
        ],
      },
    ],
    sitemap: 'https://kuon-rnd.com/sitemap.xml',
  };
}
