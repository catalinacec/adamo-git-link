# **AdamoSign**

## **Overview**

This project is a modern UI dashboard built using **Next.js**, **Tailwind CSS**, and **ShadCN/UI**. It demonstrates reusable components, dynamic typography, button variations, and global theming with a focus on performance and scalability.

## **Features**

- **Reusable Components**: Buttons, typography, and icons with dynamic states and variants.
- **Theming and Styling**: Tailwind CSS configuration with extended themes and custom fonts.
- **Responsive Design**: Fully responsive with a focus on accessibility (ARIA support).
- **Google Fonts Integration**: Open Sans font with `normal`, `semibold`, and `bold` weights.

---

## **Tech Stack**

- **Framework**: [Next.js](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [ShadCN/UI](https://shadcn.dev/)
- **Icons**: SVG-based icons with dynamic imports
- **Fonts**: Google Fonts via `next/font/google`

---

## **Installation**

1. Clone the repository:

   ```bash
   git clone https://github.com/maooricio/adamo-sign.git
   cd project-name
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser at `http://localhost:3000`.

---

## **Folder Structure**

```plaintext
project-name/
├── components/
│   ├── icon/                 # Icon components (AccountIcon, etc.)
│   ├── ui/                   # UI components (Button, Typography, etc.)
│   └── index.ts              # Export file for components
├── lib/
│   └── utils.ts              # Utility functions (e.g., className merging)
├── pages/
│   ├── _app.tsx              # Custom App component
│   ├── index.tsx             # Main page
│   └── buttons.tsx           # Buttons demo page
├── public/                   # Static assets (e.g., icons, images)
├── styles/
│   └── globals.css           # Global CSS with Tailwind imports
├── tailwind.config.js        # Tailwind configuration
├── next.config.js            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
└── README.md                 # Project documentation
```

---

## **Customization**

### **Font Configuration**

To use Open Sans across the project:

- Font weights: `400` (normal), `600` (semibold), and `700` (bold).
- Configuration in `tailwind.config.js`:
  ```javascript
  module.exports = {
    theme: {
      extend: {
        fontFamily: {
          sans: ['"Open Sans"', "sans-serif"],
        },
      },
    },
  };
  ```

### **Theme Colors**

Tailwind configuration includes extended colors for **Adamo Sign**:

- `primary`, `secondary`, `error`, and `neutral` palettes.
- Configured in `tailwind.config.js` under `extend.colors`.

### **Button Variants**

Buttons support:

- Variants: `primary`, `secondary`, `link`.
- States: Default, `isError`, `disabled`.
- Sizes: `large`, `medium`.

---

## **Usage**

### **Buttons**

Import and use the Button component:

```tsx
import { Button } from "@/components/ui/Button";

<Button>Primary Button</Button>
<Button variant="secondary" size="medium">Secondary Button</Button>
<Button isError>Button with Error</Button>
```

### **Typography**

Classes for typography:

```tsx
<p className="text-lg font-bold">Large bold text</p>
<p className="text-base font-semibold">Base semibold text</p>
<p className="text-sm">Small text</p>
<p className="text-xs">Extra Small text</p>
<p className="text-caption">Caption text</p>
```

### **Icons**

Use dynamic icons:

```tsx
import { AccountIcon } from "@/components/icon";

<AccountIcon size={24} color="currentColor" />;
```

---

## **Scripts**

- **Development**: `npm run dev` - Starts the local development server.
- **Build**: `npm run build` - Builds the project for production.
- **Lint**: `npm run lint` - Runs ESLint to check for coding errors.
- **Start**: `npm start` - Starts the production server.

---

## **Contributing**

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your message"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request.

---

## **License**

This project is licensed under the [MIT License](LICENSE).

---

## **Acknowledgements**

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [ShadCN/UI Documentation](https://shadcn.dev/)
- [Google Fonts API](https://fonts.google.com/)
