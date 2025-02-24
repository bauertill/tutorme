interface HeaderProps {
  children: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  return <header className="mb-6 space-y-4">{children}</header>;
}
