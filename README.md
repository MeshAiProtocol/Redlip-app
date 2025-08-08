# SvelteKit 5 + TypeScript + Vite Project

A modern web application built with SvelteKit 5, TypeScript, and Vite. This project demonstrates the latest features of SvelteKit 5 including the new reactivity system, file-based routing, and server-side rendering.

## 🚀 Features

- **SvelteKit 5**: Latest version with new reactivity system (`$state`, `$derived`, `$props`)
- **TypeScript**: Full type safety throughout the application
- **Vite**: Fast development server and build tool
- **File-based Routing**: Automatic route generation based on file structure
- **Server-Side Rendering (SSR)**: SEO-friendly and fast initial page loads
- **API Routes**: Built-in API endpoint support
- **Component System**: Reusable components with TypeScript props
- **Image Generation Demo**: Interactive demo with character selection and file upload

## 📁 Project Structure

```
src/
├── lib/
│   └── components/
│       └── Counter.svelte          # Reusable counter component
├── routes/
│   ├── api/
│   │   └── hello/
│   │       └── +server.ts          # API endpoint example
│   ├── image-generation/
│   │   ├── +page.svelte            # Image generation page
│   │   └── generate/
│   │       └── +page.svelte        # Generation progress page
│   ├── +layout.svelte              # Root layout
│   └── +page.svelte                # Home page
├── app.d.ts                        # TypeScript declarations
└── app.html                        # HTML template
```

## 🛠️ Getting Started

### Prerequisites

- Node.js (v20.19+ or v22.12+ or v24+)
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-sveltekit-app-new
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🎯 Key Features Demonstrated

### 1. Svelte 5 Reactivity
```typescript
// Reactive state
let count = $state(0);
let name = $state('SvelteKit 5');

// Computed values
let doubledCount = $derived(count * 2);
let greeting = $derived(`Hello, ${name}!`);
```

### 2. TypeScript Props
```typescript
// Component with typed props
let { initialValue = 0, step = 1 } = $props<{
    initialValue?: number;
    step?: number;
}>();
```

### 3. File-based Routing
- `/` - Home page with demos
- `/image-generation` - Image generation interface
- `/image-generation/generate` - Generation progress page
- `/api/hello` - API endpoint

### 4. API Routes
```typescript
// GET endpoint
export const GET: RequestHandler = async ({ url }) => {
    const name = url.searchParams.get('name') || 'World';
    return json({
        message: `Hello, ${name}!`,
        timestamp: new Date().toISOString()
    });
};
```

## 🎨 Image Generation Demo

The project includes a complete image generation demo that showcases:

- **Character Selection**: Grid of selectable character models
- **File Upload**: Drag-and-drop image upload with preview
- **Form Validation**: Ensures both character and image are selected
- **Progress Tracking**: Animated progress bar during generation
- **Toast Notifications**: User feedback for actions
- **Responsive Design**: Works on desktop and mobile

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Type-check the project
- `npm run check:watch` - Type-check in watch mode

## 🔧 Configuration Files

- `svelte.config.js` - SvelteKit configuration
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts

## 🌟 SvelteKit 5 vs Svelte 5

### Svelte 5 (Core Framework)
- Reactive UI components
- State management
- Component lifecycle
- DOM manipulation

### SvelteKit 5 (Application Framework)
- File-based routing
- Server-side rendering
- API routes
- Build optimizations
- Deployment configurations

## 🚀 Deployment

This project can be deployed to various platforms:

- **Vercel**: `npm run build && vercel --prod`
- **Netlify**: `npm run build && netlify deploy --prod`
- **Cloudflare Pages**: Connect your repository
- **Docker**: Build and deploy as container

## 📚 Learn More

- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Svelte 5 Documentation](https://svelte.dev/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vite Documentation](https://vitejs.dev/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
