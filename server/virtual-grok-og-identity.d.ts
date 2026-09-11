declare module "virtual:grok-og-identity" {
  export const grokOgIdentity: {
    site: {
      title?: string;
      description?: string;
      type?: string;
      card?: string;
      image?: string;
      banner?: string;
      color?: string;
    };
    icons: {
      icon512: boolean;
      maskable512: boolean;
    };
  };
}
