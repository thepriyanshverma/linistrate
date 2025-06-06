
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Server, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Asset {
  id: string;
  name: string;
  ip: string;
  technology: string;
  username: string;
  status: 'online' | 'offline' | 'maintenance';
  group: string;
  description?: string;
}

const Assets = () => {
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([
    {
      id: '1',
      name: 'web-server-01',
      ip: '192.168.1.10',
      technology: 'Ubuntu 22.04',
      username: 'admin',
      status: 'online',
      group: 'Web Servers',
      description: 'Main web server hosting company website'
    },
    {
      id: '2',
      name: 'db-server-01',
      ip: '192.168.1.20',
      technology: 'CentOS 8',
      username: 'root',
      status: 'online',
      group: 'Database Servers',
      description: 'Primary MySQL database server'
    },
    {
      id: '3',
      name: 'app-server-01',
      ip: '192.168.1.30',
      technology: 'Debian 11',
      username: 'deploy',
      status: 'maintenance',
      group: 'Application Servers',
      description: 'Application server running microservices'
    },
    {
      id: '4',
      name: 'cache-server-01',
      ip: '192.168.1.40',
      technology: 'Alpine Linux',
      username: 'admin',
      status: 'offline',
      group: 'Cache Servers',
      description: 'Redis cache server for session storage'
    }
  ]);

  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    ip: '',
    technology: '',
    username: '',
    status: 'online' as Asset['status'],
    group: '',
    description: ''
  });

  const groups = ['all', ...Array.from(new Set(assets.map(asset => asset.group)))];
  const filteredAssets = selectedGroup === 'all' 
    ? assets 
    : assets.filter(asset => asset.group === selectedGroup);

  const resetForm = () => {
    setFormData({
      name: '',
      ip: '',
      technology: '',
      username: '',
      status: 'online',
      group: '',
      description: ''
    });
    setEditingAsset(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (asset: Asset) => {
    setFormData({
      name: asset.name,
      ip: asset.ip,
      technology: asset.technology,
      username: asset.username,
      status: asset.status,
      group: asset.group,
      description: asset.description || ''
    });
    setEditingAsset(asset);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.ip || !formData.technology || !formData.username || !formData.group) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (editingAsset) {
      // Update existing asset
      setAssets(assets.map(asset => 
        asset.id === editingAsset.id 
          ? { ...asset, ...formData }
          : asset
      ));
      toast({
        title: "Asset updated",
        description: `${formData.name} has been updated successfully.`,
      });
    } else {
      // Add new asset
      const newAsset: Asset = {
        id: Date.now().toString(),
        ...formData
      };
      setAssets([...assets, newAsset]);
      toast({
        title: "Asset added",
        description: `${formData.name} has been added successfully.`,
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const deleteAsset = (id: string) => {
    const asset = assets.find(a => a.id === id);
    setAssets(assets.filter(a => a.id !== id));
    toast({
      title: "Asset deleted",
      description: `${asset?.name} has been removed.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online': return 'default';
      case 'offline': return 'destructive';
      case 'maintenance': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-4 animate-fade-in w-full -mt-64">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Asset Management</h1>
          <p className="text-muted-foreground">Manage your Linux infrastructure assets</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAsset ? 'Edit Asset' : 'Add New Asset'}
              </DialogTitle>
              <DialogDescription>
                {editingAsset ? 'Update the asset information below.' : 'Add a new Linux asset to your infrastructure.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="web-server-01"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ip">IP Address *</Label>
                <Input
                  id="ip"
                  placeholder="192.168.1.10"
                  value={formData.ip}
                  onChange={(e) => setFormData({...formData, ip: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="technology">Technology *</Label>
                <Input
                  id="technology"
                  placeholder="Ubuntu 22.04"
                  value={formData.technology}
                  onChange={(e) => setFormData({...formData, technology: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  placeholder="admin"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value: Asset['status']) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="group">Group *</Label>
                <Input
                  id="group"
                  placeholder="Web Servers"
                  value={formData.group}
                  onChange={(e) => setFormData({...formData, group: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of the asset"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingAsset ? 'Update Asset' : 'Add Asset'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Group Filter */}
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

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map(asset => (
          <Card key={asset.id} className="asset-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Server className="h-5 w-5" />
                  <span>{asset.name}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(asset.status)}`} />
                  <Badge variant={getStatusBadge(asset.status)}>
                    {asset.status}
                  </Badge>
                </div>
              </div>
              <CardDescription className="flex items-center space-x-2">
                <Tag className="h-4 w-4" />
                <span>{asset.group}</span>
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
                {asset.description && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-muted-foreground text-xs">{asset.description}</p>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openEditDialog(asset)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteAsset(asset.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Server className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle className="mb-2">No assets found</CardTitle>
            <CardDescription className="mb-4">
              {selectedGroup === 'all' 
                ? "Get started by adding your first Linux asset."
                : `No assets found in the "${selectedGroup}" group.`
              }
            </CardDescription>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Assets;
