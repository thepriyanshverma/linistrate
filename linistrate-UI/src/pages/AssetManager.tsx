import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, Settings, Server, Plus } from 'lucide-react';
import AddAssetForm from '../components/AddAssetForm';

interface Asset {
  id: number;
  name: string;
  ip: string;
  technology: string;
  username: string;
  password: string;
  status: 'online' | 'offline' | 'maintenance';
  group: string;
  groupColor: string;
  cpu: number;
  memory: number;
  disk: number;
}

const AssetManager = () => {
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);

  const [editForm, setEditForm] = useState({
    name: '',
    ip: '',
    username: '',
    password: '',
    confirmPassword: '',
    technology: '',
    group: ''
  });

  const technologies = [
    'Ubuntu 22.04',
    'Ubuntu 20.04',
    'CentOS 8',
    'CentOS 7',
    'Debian 11',
    'Debian 10',
    'Alpine Linux',
    'Red Hat Enterprise Linux',
    'SUSE Linux'
  ];

  const groups = [
    'Web Servers',
    'Database Servers',
    'Application Servers',
    'Cache Servers',
    'Load Balancers',
    'Monitoring Servers'
  ];

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const token = localStorage.getItem('linistrate_token'); // get token from storage

      if (!token) {
        throw new Error('No authentication token found.');
      }

      const res = await fetch('http://localhost:8000/asset/v1/get-assets', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Error fetching assets: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      // Map backend asset_id to frontend id and fill missing fields
      const mappedAssets = data.map((a: any) => ({
        id: a.asset_id,
        name: a.name,
        ip: a.ip,
        technology: a.technology,
        username: a.username,
        password: a.password,
        status: 'online',  // Default status, update if you have real data
        group: groups[a.group_id - 1] || 'Unknown',  // Assuming group_id starts at 1
        groupColor: '',    // You can add logic for groupColor if needed
        cpu: 0,
        memory: 0,
        disk: 0,
      }));

      setAssets(mappedAssets);
    } catch (err) {
      console.error('Failed to fetch assets:', err);
      toast({
        title: 'Error',
        description: 'Failed to load assets from the server. Please login again.',
        variant: 'destructive',
      });
    }
  };

  const handleAssetAdded = (newAsset: any) => {
    setAssets(prev => [...prev, newAsset]);
  };

  const handleEdit = (asset: Asset) => {
    setSelectedAsset(asset);
    setEditForm({
      name: asset.name,
      ip: asset.ip,
      username: asset.username,
      password: '',
      confirmPassword: '',
      technology: asset.technology,
      group: asset.group
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editForm.name || !editForm.ip || !editForm.username || !editForm.technology || !editForm.group) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (editForm.password && editForm.password !== editForm.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (selectedAsset) {
      setAssets(prev => prev.map(asset =>
        asset.id === selectedAsset.id
          ? {
            ...asset,
            name: editForm.name,
            ip: editForm.ip,
            username: editForm.username,
            technology: editForm.technology,
            group: editForm.group,
            ...(editForm.password && { password: editForm.password })
          }
          : asset
      ));

      toast({
        title: "Asset updated",
        description: "Asset has been updated successfully.",
      });

      setIsEditOpen(false);
      setSelectedAsset(null);
    }
  };

  const handleDelete = async (asset: Asset) => {
    if (window.confirm(`Are you sure you want to delete ${asset.name}? This action cannot be undone.`)) {
      try {
        const token = localStorage.getItem('linistrate_token');
        if (!token) throw new Error('No authentication token found.');

        const res = await fetch(`http://localhost:8000/asset/v1/delete-asset/${asset.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to delete: ${res.statusText}`);
        }

        setAssets(prev => prev.filter(a => a.id !== asset.id));

        toast({
          title: "Asset deleted",
          description: `${asset.name} has been deleted.`,
        });
      } catch (err) {
        console.error('Delete error:', err);
        toast({
          title: "Error deleting asset",
          description: String(err),
          variant: "destructive",
        });
      }
    }
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
          <h1 className="text-3xl font-bold">Asset Manager</h1>
          <p className="text-muted-foreground">Manage and configure your Linux assets</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Asset</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map(asset => (
          <Card key={asset.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Server className="h-5 w-5" />
                  <CardTitle className="text-lg">{asset.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(asset.status)}`} />
                  <Badge variant={getStatusBadge(asset.status)}>
                    {asset.status}
                  </Badge>
                </div>
              </div>
              <CardDescription>{asset.group}</CardDescription>
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

              <div className="flex space-x-2 pt-2 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(asset)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(asset)}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Asset Form Dialog */}
      <AddAssetForm
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAssetAdded={handleAssetAdded}
      />

      {/* Edit Asset Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
            <DialogDescription>
              Update the configuration for {selectedAsset?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Asset Name *</Label>
              <Input
                id="editName"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editIp">IP Address *</Label>
              <Input
                id="editIp"
                value={editForm.ip}
                onChange={(e) => setEditForm({ ...editForm, ip: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editUsername">Username *</Label>
              <Input
                id="editUsername"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editPassword">New Password (leave empty to keep current)</Label>
              <Input
                id="editPassword"
                type="password"
                placeholder="Enter new password"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editConfirmPassword">Confirm New Password</Label>
              <Input
                id="editConfirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={editForm.confirmPassword}
                onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Technology *</Label>
              <Select value={editForm.technology} onValueChange={(value) => setEditForm({ ...editForm, technology: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {technologies.map(tech => (
                    <SelectItem key={tech} value={tech}>
                      {tech}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Group *</Label>
              <Select value={editForm.group} onValueChange={(value) => setEditForm({ ...editForm, group: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {groups.map(group => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Settings className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssetManager;
