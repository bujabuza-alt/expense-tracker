import { Wallet } from 'lucide-react';
import { TODAY } from '../utils';

export default function Header() {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Wallet className="w-5 h-5 text-violet-400" />
        <h1 className="text-lg font-bold tracking-tight">지출 트래커</h1>
      </div>
      <time className="text-xs text-gray-500">{TODAY}</time>
    </header>
  );
}
