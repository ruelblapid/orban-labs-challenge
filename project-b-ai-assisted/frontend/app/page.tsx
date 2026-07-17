import { ShortenForm } from "@/app/components/ShortenForm";

export default function Home() {
  return (
    <div>
      <h1>Shorten a URL</h1>
      <p className="page-subtitle">Paste a long URL below to get a short, trackable link.</p>
      <ShortenForm />
    </div>
  );
}
