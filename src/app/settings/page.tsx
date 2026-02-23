import MetadataManager from '@/components/MetadataManager';

export default function Settings() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetadataManager />
        {/* Other settings can go here */}
      </div>
    </div>
  );
}
