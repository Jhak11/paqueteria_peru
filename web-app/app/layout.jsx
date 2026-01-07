import './globals.css';
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
export const metadata = {
  title: 'Paquetería Perú',
  description: 'Sistema Integral de Logística',
};
export default function RootLayout({ children, }) {
  return (<html lang="es">
    <body className={inter.className}>
      {children}
      {/* Suppress MetaMask extension errors in development */}
      {process.env.NODE_ENV === 'development' && (
        <script dangerouslySetInnerHTML={{
          __html: `
              (function() {
                const originalError = console.error;
                console.error = function(...args) {
                  const msg = args[0]?.toString() || '';
                  // Suppress MetaMask-related errors
                  if (msg.includes('MetaMask') || 
                      msg.includes('chrome-extension://') || 
                      msg.includes('__nextjs_original-stack-frame') ||
                      msg.includes('ethereum')) {
                    return;
                  }
                  originalError.apply(console, args);
                };
              })();
            `
        }} />
      )}
    </body>
  </html>);
}
