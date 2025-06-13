'use client';

import { useState, useEffect } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Settings, Server, Plus } from 'lucide-react';

const predefinedColors = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
  '#ef4444', '#06b6d4', '#84cc16', '#f97316',
];

const initialFormState = {
  name: '',
  ip: '',
  technology: '',
  username: '',
  password: '',
  confirmPassword: '',
  groupOption: 'existing',
  existingGroup: '',
  newGroupName: '',
  newGroupColor: '#3b82f6',
};

export default function AssetManager() {
  const { toast } = useToast();
  const { fetchWithAuth } = useAuth();

  const [assets, setAssets] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [dbGroups, setDbGroups] = useState<{ name: string; color: string }[]>([]);
  const [technologies, setTechnologies] = useState<{ technology_id: number; name: string }[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedTechnology, setSelectedTechnology] = useState<string>('all');

  useEffect(() => {
    fetchAssets();
    fetchTechnologies();
  }, []);

  const fetchAssets = async () => {
    try {
      const data = await fetchWithAuth('http://localhost:8000/asset/v1/get-assets');
      if (Array.isArray(data)) setAssets(data);
    } catch (error) {
      console.error('Failed to load assets', error);
    }
  };

  const fetchTechnologies = async () => {
    try {
      const techs = await fetchWithAuth("http://localhost:8000/technology/v1/get-technologies");
      if (Array.isArray(techs)) setTechnologies(techs);
    } catch (err) {
      console.error("Error loading technologies", err);
    }
  };

  const openForm = (mode: 'add' | 'edit', asset?: any) => {
    setMode(mode);
    setEditingAsset(asset || null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormData(initialFormState);
    setEditingAsset(null);
  };

  const handleEdit = (asset: any) => {
    openForm('edit', asset);
  };

  useEffect(() => {
    if (!isFormOpen || (mode === 'edit' && !editingAsset)) return;
    const fetchGroupsAndTech = async () => {
      try {
        const groups = await fetchWithAuth("http://localhost:8000/group/v1/get-groups");
        if (Array.isArray(groups)) setDbGroups(groups);

        if (mode === 'edit' && editingAsset) {
          const techId = typeof editingAsset.technology === 'object'
            ? editingAsset.technology.technology_id
            : editingAsset.technology;

          setFormData({
            name: editingAsset.name || '',
            ip: editingAsset.ip || '',
            technology: techId?.toString() || '',
            username: editingAsset.username || '',
            password: '',
            confirmPassword: '',
            groupOption: 'existing',
            existingGroup: typeof editingAsset.group === 'object' ? editingAsset.group.name : editingAsset.group?.trim() || '',
            newGroupName: '',
            newGroupColor: '#3b82f6',
          });
        }
      } catch (err) {
        console.error("Error loading groups/technologies", err);
      }
    };

    fetchGroupsAndTech();
  }, [isFormOpen, mode, editingAsset]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      name, ip, technology, username, password, confirmPassword,
      groupOption, existingGroup, newGroupName, newGroupColor,
    } = formData;

    if (!name || !ip || !technology || !username) {
      return toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
    }

    if ((password || confirmPassword) && password !== confirmPassword) {
      return toast({ title: "Password mismatch", description: "Passwords do not match.", variant: "destructive" });
    }

    const groupName = groupOption === 'existing' ? existingGroup.trim() : newGroupName;
    if (!groupName) {
      return toast({ title: "Group missing", description: "Please select or create a group.", variant: "destructive" });
    }

    const groupColor =
      groupOption === 'existing'
        ? dbGroups.find(g => g.name.trim() === groupName)?.color || '#3b82f6'
        : newGroupColor;

    const payload: any = {
      name,
      ip,
      technology: parseInt(technology),
      username,
      group: groupName,
      group_color: groupColor,
    };

    if (password) payload.password = password;

    try {
      const url = mode === 'edit'
        ? `http://localhost:8000/asset/v1/edit-asset/${editingAsset.asset_id}`
        : 'http://localhost:8000/asset/v1/add-asset';

      const result = await fetchWithAuth(url, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });

      if (result) {
        fetchAssets();
        toast({
          title: mode === 'edit' ? "Asset updated" : "Asset added",
          description: mode === 'edit' ? "Asset updated successfully." : "New asset added successfully.",
          variant: "success",
        });
        closeForm();
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast({ title: "Submission failed", description: "Could not connect to the server or process the asset.", variant: "destructive" });
    }
  };

  const handleDelete = async (assetId: number) => {
    if (!confirm("Are you sure you want to delete this asset?")) return;
    try {
      const res = await fetchWithAuth(`http://localhost:8000/asset/v1/delete-asset/${assetId}`, {
        method: "DELETE",
      });
      if (res?.success || res?.status === "success") {
        toast({
          title: "Asset Deleted",
          description: "The asset has been removed.",
          variant: "success",
        });
        fetchAssets();
      } else {
        throw new Error("Deletion failed");
      }
    } catch (err) {
      console.error("Error deleting asset", err);
      toast({
        title: "Failed to delete",
        description: "There was an error deleting the asset.",
        variant: "destructive",
      });
    }
  };

const filteredAssets = assets.filter(asset => {
  const groupName = typeof asset.group === 'object' ? asset.group?.name : asset.group_r?.name;
  const matchesGroup = selectedGroup === 'all' || groupName?.toLowerCase() === selectedGroup.toLowerCase();

  const techId = typeof asset.technology === 'number'
    ? asset.technology.toString()
    : asset.technology?.technology_id?.toString();

  const matchesTechnology = selectedTechnology === 'all' || techId === selectedTechnology;

  return matchesGroup && matchesTechnology;
});


  return (
    <div className="space-y-4 animate-fade-in w-full -mt-64">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Asset Manager</h1>
        <Button onClick={() => openForm('add')}>+ Add Asset</Button>
      </div>

      <div className="mb-4 flex items-center space-x-4">
  <Label>Filter by Group:</Label>
  <Select value={selectedGroup} onValueChange={setSelectedGroup}>
    <SelectTrigger className="w-[200px]">
      <SelectValue placeholder="Select a group" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Groups</SelectItem>
      {Array.from(new Set(assets.map(a =>
        typeof a.group === 'object' ? a.group?.name : a.group_r?.name
      )))
        .filter(Boolean)
        .map(groupName => (
          <SelectItem key={groupName} value={groupName || ''}>
            {groupName}
          </SelectItem>
        ))}
    </SelectContent>
  </Select>

  <Label>Filter by Technology:</Label>
  <Select value={selectedTechnology} onValueChange={setSelectedTechnology}>
    <SelectTrigger className="w-[200px]">
      <SelectValue placeholder="Select a technology" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Technologies</SelectItem>
      {technologies.map(tech => (
        <SelectItem key={tech.technology_id} value={tech.technology_id.toString()}>
          {tech.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
      
      

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map(asset => (
          <Card key={asset.asset_id}>
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
                <span
                  className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full text-white"
                  style={{ backgroundColor: asset.group_r?.color || '#9CA3AF' }}
                >
                  {asset.group_r?.name || 'No Group'}
                </span>
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
                  <span>
                    {typeof asset.technology === 'number'
                      ? technologies.find(t => t.technology_id === asset.technology)?.name || `Unknown (${asset.technology})`
                      : asset.technology?.name || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Username:</span>
                  <span className="font-mono">{asset.username}</span>
                </div>
              </div>
              <div className="flex space-x-2 pt-2 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => handleEdit(asset)} className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(asset.asset_id)} className="flex-1">
                  <Trash2 className="h-4 w-4 mr-2" />Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form dialog */}
      <Dialog open={isFormOpen} onOpenChange={closeForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{mode === 'edit' ? 'Edit Asset' : 'Add Asset'}</DialogTitle>
            <DialogDescription>
              {mode === 'edit' ? `Update the configuration for ${editingAsset?.name}` : 'Fill in the details to add a new asset.'}
            </DialogDescription>
          </DialogHeader>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Asset Name</Label>
              <Input value={formData.name} onChange={e => handleInputChange('name', e.target.value)} required />
            </div>

            <div>
              <Label>IP Address</Label>
              <Input value={formData.ip} onChange={e => handleInputChange('ip', e.target.value)} required />
            </div>

            <div>
              <Label>Username</Label>
              <Input value={formData.username} onChange={e => handleInputChange('username', e.target.value)} required />
            </div>

            <div>
              <Label>New Password</Label>
              <Input type="password" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} />
            </div>

            <div>
              <Label>Confirm New Password</Label>
              <Input type="password" value={formData.confirmPassword} onChange={e => handleInputChange('confirmPassword', e.target.value)} />
            </div>

            <div>
              <Label>Technology</Label>
              <Select value={formData.technology} onValueChange={value => handleInputChange('technology', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a technology" />
                </SelectTrigger>
                <SelectContent>
                  {technologies.map(tech => (
                    <SelectItem key={tech.technology_id} value={tech.technology_id.toString()}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Group</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  type="button"
                  variant={formData.groupOption === 'existing' ? 'default' : 'outline'}
                  onClick={() => handleInputChange('groupOption', 'existing')}
                >
                  Use Existing
                </Button>
                <Button
                  type="button"
                  variant={formData.groupOption === 'new' ? 'default' : 'outline'}
                  onClick={() => handleInputChange('groupOption', 'new')}
                >
                  Create New
                </Button>
              </div>

              {formData.groupOption === 'existing' ? (
                <Select
                  value={formData.existingGroup}
                  onValueChange={value => handleInputChange('existingGroup', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {dbGroups.map(group => (
                      <SelectItem key={group.name} value={group.name}>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full inline-block"
                            style={{ backgroundColor: group.color }}
                          />
                          {group.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="space-y-2">
                  <Input
                    placeholder="New Group Name"
                    value={formData.newGroupName}
                    onChange={e => handleInputChange('newGroupName', e.target.value)}
                  />
                  <div className="flex flex-wrap gap-3 items-center">
                    {predefinedColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`w-6 h-6 rounded-full border-2 transition ${
                          formData.newGroupColor === color ? 'border-black scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => handleInputChange('newGroupColor', color)}
                      />
                    ))}
                    <label className="flex items-center gap-3 border px-2 py-1 rounded">
                      <span className="text-sm">Custom</span>
                      <input
                        type="color"
                        value={formData.newGroupColor}
                        onChange={(e) => handleInputChange('newGroupColor', e.target.value)}
                        className="w-6 h-6 border-none bg-transparent cursor-pointer p-0"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="submit">{mode === 'edit' ? 'Update Asset' : 'Add Asset'}</Button>
              <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
