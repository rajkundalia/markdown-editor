// CSS Module declarations
declare module '*.css' {
    const content: Record<string, string>;
    export default content;
  }
  
  declare module '*.scss' {
    const content: Record<string, string>;
    export default content;
  }
  
  declare module '*.sass' {
    const content: Record<string, string>;
    export default content;
  }
  
  // Specific global CSS imports
  declare module './globals.css';
  declare module '../globals.css';
  declare module '../../globals.css';
  
  // Next.js specific types
  declare module 'next/font/google' {
    export function Inter(options: any): any;
    export function Fira_Code(options: any): any;
  }