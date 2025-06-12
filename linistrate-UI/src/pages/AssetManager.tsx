import { useState, useEffect } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, Settings, Server, Plus } from 'lucide-react';
import AddAssetForm from '../components/AddAssetForm';

interface Asset {
  id: number;
  name: string;
  ip: string;
  technology: string;
  technology_id: number;
  username: string;
  password: string;
  status: 'online' | 'offline' | 'maintenance';
  group: string;
  group_id: number;
  groupColor: string;
  cpu: number;
  memory: number;
  disk: number;
}

interface Technology {
  id: number;
  name: string;
}

interface Group {
  id: number;
  name: string;
  color?: string;
}

const AssetManager = () => {
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [editForm, setEditForm] = useState({
    name: '',
    ip: '',
    username: '',
    password: '',
    confirmPassword: '',
    technology: '',
    group: ''
  });

  const fetchAll = async () => {
    try {
      const token = localStorage.getItem('linistrate_token');
      if (!token) throw new Error('No authentication token found.');

      const [techRes, groupRes, assetRes] = await Promise.all([
        fetch('http://localhost:8000/technology/v1/get-technologies', {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
        }),
        fetch('http://localhost:8000/group/v1/get-groups', {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
        }),
        fetch('http://localhost:8000/asset/v1/get-assets', {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
        }),
      ]);

      if (!techRes.ok || !groupRes.ok || !assetRes.ok) {
        throw new Error('Failed to fetch some resources.');
      }

      const techData = await techRes.json();
      const groupData = await groupRes.json();
      const assetData = await assetRes.json();

      setTechnologies(techData);
      setGroups(groupData);

      const mappedAssets: Asset[] = assetData.map((a: any) => {
        const tech = techData.find((t: any) => t.id === Number(a.technology));
        const group = a.group_r;
        return {
          id: a.asset_id,
          name: a.name,
          ip: a.ip,
          technology: tech?.name || 'Unknown',
          technology_id: tech?.id || -1,
          username: a.username,
          password: a.password,
          status: 'online',
          group: group?.name || 'Unknown',
          group_id: group?.id || -1,
          groupColor: group?.color || '#9CA3AF',
          cpu: 0,
          memory: 0,
          disk: 0,
        };
      });

      setAssets(mappedAssets);
    } catch (err) {
      console.error('Error loading assets:', err);
      toast({
        title: 'Error',
        description: 'Failed to load data. Please login again.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleAssetAdded = () => {
    fetchAll();
  };

  const handleEdit = (asset: Asset) => {
    setSelectedAsset(asset);
setEditForm({
  name: asset.name,
  ip: asset.ip,
  username: asset.username,
  password: '',
  confirmPassword: '',
  technology: String(asset.technology_id), // 👈 store as string
  group: String(groups.find(g => g.name === asset.group)?.id || ''), // 👈 match by name, get id
});

    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
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

    try {
      const token = localStorage.getItem('linistrate_token');
      if (!token) throw new Error('No token');

      const techId = Number(editForm.technology);
      const groupId = Number(editForm.group);
      const groupObj = groups.find(g => g.id === groupId);

      if (!techId || !groupObj) {
        toast({
          title: 'Invalid selection',
          description: 'Technology or group not found.',
          variant: 'destructive',
        });
        return;
      }

      const payload = {
        name: editForm.name,
        ip: editForm.ip,
        username: editForm.username,
        password: editForm.password || selectedAsset?.password,
        technology: techId,
        group: groupId,
        group_color: groupObj.color || '#9CA3AF',
        is_active: true,
      };

      const res = await fetch(`http://localhost:8000/asset/v1/edit-asset/${selectedAsset?.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(JSON.stringify(errData));
      }

      toast({
        title: "Asset updated",
        description: "Asset has been updated successfully.",
      });

      setIsEditOpen(false);
      setSelectedAsset(null);
      fetchAll();
    } catch (err) {
      console.error('Update error:', err);
      toast({
        title: "Error updating asset",
        description: String(err),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (asset: Asset) => {
    if (!window.confirm(`Delete ${asset.name}? This action cannot be undone.`)) return;

    try {
      const token = localStorage.getItem('linistrate_token');
      if (!token) throw new Error('No authentication token found.');

      const res = await fetch(`http://localhost:8000/asset/v1/delete-asset/${asset.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });

      if (!res.ok) throw new Error(`Failed to delete: ${res.statusText}`);

      setAssets(prev => prev.filter(a => a.id !== asset.id));
      toast({ title: "Asset deleted", description: `${asset.name} has been deleted.`, variant: "success" });

    } catch (err) {
      console.error('Delete error:', err);
      toast({ title: "Error deleting asset", description: String(err), variant: "destructive" });
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
                  <div className={`w-2 h-2 rounded-full ${asset.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <Badge variant="outline">{asset.status}</Badge>
                </div>
              </div>
              <CardDescription>
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full text-white"
                  style={{ backgroundColor: asset.groupColor || '#9CA3AF' }}>
                  {asset.group || 'No Group'}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">IP Address:</span><span className="font-mono">{asset.ip}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Technology:</span><span>{asset.technology}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Username:</span><span className="font-mono">{asset.username}</span></div>
              </div>
              <div className="flex space-x-2 pt-2 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => handleEdit(asset)} className="flex-1"><Edit className="h-4 w-4 mr-2" />Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(asset)} className="flex-1"><Trash2 className="h-4 w-4 mr-2" />Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddAssetForm isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAssetAdded={handleAssetAdded} />

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
            <DialogDescription>Update the configuration for {selectedAsset?.name}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="space-y-2"><Label>Asset Name *</Label><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>IP Address *</Label><Input value={editForm.ip} onChange={(e) => setEditForm({ ...editForm, ip: e.target.value })} /></div>
            <div className="space-y-2"><Label>Username *</Label><Input value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} /></div>
            <div className="space-y-2"><Label>New Password</Label><Input type="password" placeholder="Leave blank to keep current" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} /></div>
            <div className="space-y-2"><Label>Confirm New Password</Label><Input type="password" value={editForm.confirmPassword} onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Technology *</Label>
<Select value={editForm.technology} onValueChange={(value) => setEditForm({ ...editForm, technology: value })}>
  <SelectTrigger>
    <SelectValue placeholder="Select technology" />
  </SelectTrigger>
  <SelectContent>
    {technologies.map(tech => (
      <SelectItem key={tech.id} value={tech.name}>
        {tech.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>


            </div>
            <div className="space-y-2">
              <Label>Group *</Label>
<Select value={editForm.group} onValueChange={(value) => setEditForm({ ...editForm, group: value })}>
  <SelectTrigger>
    <SelectValue placeholder="Select group" />
  </SelectTrigger>
  <SelectContent>
    {groups.map(group => (
      <SelectItem key={group.id} value={group.name}>
        {group.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>


            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit"><Settings className="h-4 w-4 mr-2" />Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssetManager;
