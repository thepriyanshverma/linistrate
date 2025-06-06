import { useState, useEffect } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Server, Cpu, HardDrive, Activity } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  ip: string;
  technology: string;
  username: string;
  status: 'online' | 'offline' | 'maintenance';
  group: string;
  groupColor?: string;
  cpu: number;
  memory: number;
  disk: number;
}

const Dashboard = () => {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState<boolean>(false);

  useEffect(() => {
    const fetchAssets = async () => {
      const token = localStorage.getItem('linistrate_token');
      if (!token) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('http://localhost:8000/asset/v1/get-assets', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem('linistrate_token');
          setUnauthorized(true);
          return;
        }

        if (!response.ok) {
          throw new Error(`Error fetching assets: ${response.statusText}`);
        }

        const data: Asset[] = await response.json();
        setAssets(data);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const groups = ['all', ...Array.from(new Set(assets.map(asset => asset.group)))];
  const filteredAssets = selectedGroup === 'all'
    ? assets
    : assets.filter(asset => asset.group === selectedGroup);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online': return 'default';
      case 'offline': return 'destructive';
      case 'maintenance': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  if (unauthorized) {
    return <div className="p-4 text-center text-red-500">Unauthorized. Please login again.</div>;
  }

  if (loading) {
    return <div className="p-4 text-center">Loading assets...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

return (
  <div className="space-y-4 animate-fade-in w-full -mt-64">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Monitor your Linux infrastructure</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {assets.filter(a => a.status === 'online').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
            <Activity className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {assets.filter(a => a.status === 'offline').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Activity className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {assets.filter(a => a.status === 'maintenance').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Asset Cards */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium">Filter by group:</label>
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {groups.map(group => (
                <SelectItem key={group} value={group}>
                  {group === 'all' ? 'All Groups' : group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map(asset => (
            <Card key={asset.id} className="asset-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{asset.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(asset.status)}`} />
                    <Badge variant={getStatusBadge(asset.status)}>
                      {asset.status}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="flex items-center space-x-2">
                  <span>{asset.group}</span>
                  {asset.groupColor && (
                    <div
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: asset.groupColor }}
                    />
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IP Address:</span>
                    <span className="font-mono">{asset.ip}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Technology:</span>
                    <span>{asset.technology}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Username:</span>
                    <span className="font-mono">{asset.username}</span>
                  </div>
                </div>

                {asset.status === 'online' && (
                  <div className="space-y-3 pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Cpu className="h-4 w-4" />
                        <span>CPU</span>
                      </div>
                      <span>{asset.cpu}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="bg-primary rounded-full h-1.5" style={{ width: `${asset.cpu}%` }} />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4" />
                        <span>Memory</span>
                      </div>
                      <span>{asset.memory}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="bg-blue-500 rounded-full h-1.5" style={{ width: `${asset.memory}%` }} />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <HardDrive className="h-4 w-4" />
                        <span>Disk</span>
                      </div>
                      <span>{asset.disk}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="bg-orange-500 rounded-full h-1.5" style={{ width: `${asset.disk}%` }} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
