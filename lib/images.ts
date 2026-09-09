/**
 * Marketing photography used across the site.
 *
 * Photos are royalty-free stock hosted on Unsplash (Unsplash License — free for
 * commercial use, no attribution required). They are loaded as remote images and
 * optimised by `next/image`; the Unsplash hosts are allow-listed in
 * `next.config.ts` under `images.remotePatterns`.
 *
 * `blurDataURL` is a tiny inline JPEG for `next/image` `placeholder="blur"`.
 */
const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;

export const marketingImages = {
  // assorted grains / pulses flat-lay — Maddi Bazzocco
  heroStaples: {
    src: unsplash("photo-1542990253-a781e04c0082"),
    width: 1600,
    height: 1067,
    blurDataURL:
      "data:image/jpeg;base64,/9j/2wBDABIMDRANCxIQDhAUExIVGywdGxgYGzYnKSAsQDlEQz85Pj1HUGZXR0thTT0+WXlaYWltcnNyRVV9hnxvhWZwcm7/2wBDARMUFBsXGzQdHTRuST5Jbm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm7/wAARCAALABADASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAgUG/8QAHxAAAgEEAgMAAAAAAAAAAAAAAgMBAAQRIRIxYYGR/8QAFAEBAAAAAAAAAAAAAAAAAAAAA//EABcRAQEBAQAAAAAAAAAAAAAAAAEAAhH/2gAMAwEAAhEDEQA/ANVNwvgRc4wMZndSYfc3JwFi9KZKMzBbLx3SDZOXOxFZYj1miq2VfWK2vHLOuY6n7Qqs2eF//9k=",
  },
  // pallet racking with cartons — CHUTTERSNAP
  warehouse: {
    src: unsplash("photo-1587293852726-70cdb56c2866"),
    width: 1600,
    height: 1067,
    blurDataURL:
      "data:image/jpeg;base64,/9j/2wBDABIMDRANCxIQDhAUExIVGywdGxgYGzYnKSAsQDlEQz85Pj1HUGZXR0thTT0+WXlaYWltcnNyRVV9hnxvhWZwcm7/2wBDARMUFBsXGzQdHTRuST5Jbm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm7/wAARCAALABADASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAgMF/8QAIRABAAIBAwQDAAAAAAAAAAAAAQIDEQAEQRITUWEhMeH/xAAUAQEAAAAAAAAAAAAAAAAAAAAC/8QAFREBAQAAAAAAAAAAAAAAAAAAAAH/2gAMAwEAAhEDEQA/AMjaVNsSiEkbrHq9RP10t00VXFs6hhGDER5PB44zqO2Xs2yy5YvzzzoZTYCffUxz6ONA4//Z",
  },
  // stocked grocery aisle — Nathália Rosa
  dealerShop: {
    src: unsplash("photo-1578916171728-46686eac8d58"),
    width: 1600,
    height: 1067,
    blurDataURL:
      "data:image/jpeg;base64,/9j/2wBDABIMDRANCxIQDhAUExIVGywdGxgYGzYnKSAsQDlEQz85Pj1HUGZXR0thTT0+WXlaYWltcnNyRVV9hnxvhWZwcm7/2wBDARMUFBsXGzQdHTRuST5Jbm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm7/wAARCAALABADASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAgEE/8QAHhABAAICAgMBAAAAAAAAAAAAAQIRACEDMQQFEhP/xAAVAQEBAAAAAAAAAAAAAAAAAAADBP/EABcRAQEBAQAAAAAAAAAAAAAAAAEAEiH/2gAMAwEAAhEDEQA/ANPAQnC0lFdBVjl5PnsuTd61g9aum2y0t6wecv7SRpd2ayd4SCav/9k=",
  },
} as const;
