export function generateStaticParams() {
  return [{ id: 'dummy' }];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
