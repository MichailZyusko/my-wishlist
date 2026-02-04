import './global.css';
import Providers from './providers';

export const metadata = {
  title: 'My Wishlist',
  description: 'Wishlist app with referral links',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
