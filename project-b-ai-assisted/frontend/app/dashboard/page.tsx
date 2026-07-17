import { UrlsTable } from "@/app/components/UrlsTable";

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p className="page-subtitle">Every URL you&apos;ve shortened, with click counts.</p>
      <UrlsTable />
    </div>
  );
}
