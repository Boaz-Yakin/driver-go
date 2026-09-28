export function generateStaticParams() {
  return [{ token: 'dummy' }];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
