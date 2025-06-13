import { useEffect, useState } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Server } from 'lucide-react';

interface Group {
  name: string;
  color: string;
}

interface Technology {
  technology_id: number;
  name: string;
}

interface Asset {
  asset_id: number;
  name: string;
  ip: string;
  username: string;
  technology: number;
  status: 'online' | 'offline' | 'maintenance';
  group_r?: Group;
}

const Dashboard = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedTech, setSelectedTech] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('linistrate_token');
      try {
        const [assetRes, techRes] = await Promise.all([
          fetch('http://localhost:8000/asset/v1/get-assets', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('http://localhost:8000/technology/v1/get-technologies', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        const assetData = await assetRes.json();
        const techData = await techRes.json();
        setAssets(assetData);
        setTechnologies(techData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const groupOptions = ['all', ...Array.from(new Set(assets.map(a => a.group_r?.name).filter(Boolean)))];
  const techOptions = ['all', ...technologies.map(t => t.name)];

  const filteredAssets = assets.filter(asset => {
    const groupMatch = selectedGroup === 'all' || asset.group_r?.name === selectedGroup;
    const techName = technologies.find(t => t.technology_id === asset.technology)?.name;
    const techMatch = selectedTech === 'all' || techName === selectedTech;
    return groupMatch && techMatch;
  });

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-red-500 text-center">{error}</div>;

  return (
  <div className="space-y-4 animate-fade-in w-full -mt-64">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Monitor your Linux infrastructure</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="w-48">
          <label className="block text-sm font-medium mb-1">Group</label>
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger><SelectValue placeholder="Select Group" /></SelectTrigger>
            <SelectContent>
              {groupOptions.map(g => (
                <SelectItem key={g} value={g}>{g === 'all' ? 'All Groups' : g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-48">
          <label className="block text-sm font-medium mb-1">Technology</label>
          <Select value={selectedTech} onValueChange={setSelectedTech}>
            <SelectTrigger><SelectValue placeholder="Select Technology" /></SelectTrigger>
            <SelectContent>
              {techOptions.map(t => (
                <SelectItem key={t} value={t}>{t === 'all' ? 'All Technologies' : t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Assets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map(asset => {
          const techName = technologies.find(t => t.technology_id === asset.technology)?.name || 'Unknown';
          return (
            <Card key={asset.asset_id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{asset.name}</CardTitle>
                  <Badge>{asset.status}</Badge>
                </div>
                <CardDescription>
                  <span
                    className="inline-block px-2 py-1 text-xs rounded"
                    style={{ backgroundColor: asset.group_r?.color || '#999', color: '#fff' }}
                  >
                    {asset.group_r?.name || 'No Group'}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <div><strong>IP:</strong> {asset.ip}</div>
                <div><strong>Username:</strong> {asset.username}</div>
                <div><strong>Technology:</strong> {techName}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
