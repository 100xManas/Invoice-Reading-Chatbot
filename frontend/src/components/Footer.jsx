export default function Footer() {
  return (
    <footer className="w-full bg-zinc-800 text-center py-4 text-sm text-gray-400">
      © {new Date().getFullYear()} DocTalk. All rights reserved.
    </footer>
  );
}