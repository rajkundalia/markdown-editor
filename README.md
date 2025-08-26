# Next.js Markdown Editor with Live Preview

A feature-rich markdown editor built with Next.js, TypeScript, and TailwindCSS featuring live preview, syntax highlighting, dark mode, and resizable panes.

## Features

- **Two-Pane Layout**: Split editor and preview with CSS Grid
- **Live Preview**: Real-time markdown rendering as you type
- **Full Markdown Support**: Headings, bold, italic, lists, code blocks, links, tables, and more
- **Toolbar**: Quick insertion buttons for common markdown syntax
- **File Operations**: Import/export markdown files
- **Persistence**: Auto-save to localStorage with restoration on reload
- **Themes**: Light/Dark mode toggle with Tailwind CSS
- **Syntax Highlighting**: Code blocks with Prism.js highlighting
- **Resizable Panes**: Drag to resize editor vs preview panels
- **TypeScript**: Fully typed with proper event handling and component props

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **marked** - Markdown parsing
- **Prism.js** - Syntax highlighting
- **Lucide React** - Icons

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles and Prism themes
│   ├── layout.tsx           # Root layout with theme provider
│   └── page.tsx             # Main page component
├── components/
│   ├── Editor.tsx           # Markdown editor textarea
│   ├── Preview.tsx          # Rendered markdown preview
│   ├── Toolbar.tsx          # Markdown formatting toolbar
│   ├── FileOperations.tsx   # Import/export functionality
│   ├── ThemeToggle.tsx      # Light/dark mode toggle
│   └── ResizablePane.tsx    # Resizable panel container
├── hooks/
│   ├── useLocalStorage.tsx  # localStorage persistence hook
│   ├── useTheme.tsx         # Theme management hook
│   └── useResizable.tsx     # Resizable pane logic hook
├── types/
│   └── index.ts             # TypeScript type definitions
└── utils/
    └── markdown.ts          # Markdown parsing utilities
```

## Key Components

### Editor Component
- Handles markdown input with proper TypeScript event typing
- Auto-resizing textarea
- Cursor position management for toolbar insertions

### Preview Component
- Real-time markdown rendering with marked
- Syntax highlighting for code blocks
- Sanitized HTML output

### Toolbar Component
- Quick formatting buttons (bold, italic, headers, code, lists)
- Proper cursor position insertion
- Keyboard shortcuts support

### FileOperations Component
- Import .md files with File API
- Export current content as downloadable .md file
- Proper error handling and user feedback

### ResizablePane Component
- Mouse-based pane resizing
- Responsive design with mobile fallback
- Smooth drag interactions

## Customization

### Adding New Toolbar Buttons
```typescript
const newButton: ToolbarButton = {
  label: 'Custom',
  icon: CustomIcon,
  action: 'wrap', // or 'insert'
  syntax: '**custom**',
  shortcut: 'Ctrl+U'
};
```

### Custom Markdown Extensions
Extend the markdown parser in `utils/markdown.ts`:
```typescript
marked.use({
  extensions: [
    // Add custom extensions here
  ]
});
```

### Styling Themes
Modify `globals.css` for custom syntax highlighting themes or add new Tailwind color schemes.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+