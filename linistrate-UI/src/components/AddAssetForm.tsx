import { useState, useEffect } from 'react';
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

interface AddAssetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetAdded: (asset: any) => void;
  mode?: 'add' | 'edit';
  existingData?: any;
}

const AddAssetForm = ({
  isOpen, onClose, onAssetAdded, mode = 'add', existingData,
}: AddAssetFormProps) => {
  const { toast } = useToast();
  const { fetchWithAuth } = useAuth();

  const [formData, setFormData] = useState({
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
  });

  const [dbGroups, setDbGroups] = useState<{ name: string; color: string }[]>([]);
  const [technologies, setTechnologies] = useState<{ technology_id: number; name: string }[]>([]);

  const predefinedColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
    '#ef4444', '#06b6d4', '#84cc16', '#f97316',
  ];

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetchWithAuth("http://localhost:8000/group/v1/get-groups");
        setDbGroups(res);
      } catch (err) {
        console.error("Failed to fetch groups", err);
      }
    };

    const fetchTechnologies = async () => {
      try {
        const res = await fetchWithAuth('http://localhost:8000/technology/v1/get-technologies');
        if (Array.isArray(res)) setTechnologies(res);
        else console.error('Unexpected format:', res);
      } catch (err) {
        console.error('Failed to fetch technologies:', err);
      }
    };

    if (isOpen) {
      fetchGroups();
      fetchTechnologies();

      if (mode === 'edit' && existingData) {
        const techId = typeof existingData.technology === 'object'
          ? existingData.technology?.technology_id
          : existingData.technology;

        setFormData({
          name: existingData.name || '',
          ip: existingData.ip || '',
          technology: techId?.toString() || '',
          username: existingData.username || '',
          password: '',
          confirmPassword: '',
          groupOption: 'existing',
          existingGroup: existingData.group?.trim() || '',
          newGroupName: '',
          newGroupColor: '#3b82f6',
        });
      }
    }
  }, [isOpen, mode, existingData]);

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
      return toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
    }

    if ((password || confirmPassword) && password !== confirmPassword) {
      return toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
    }

    const groupName = groupOption === 'existing' ? existingGroup.trim() : newGroupName;

    if (!groupName) {
      return toast({
        title: "Group missing",
        description: "Please select or create a group.",
        variant: "destructive",
      });
    }

    const payload: any = {
      name,
      ip,
      technology: parseInt(technology),
      username,
      group: groupName,
      group_color:
        groupOption === 'existing'
          ? dbGroups.find(g => g.name.trim() === groupName)?.color || '#3b82f6'
          : newGroupColor,
    };

    if (password) {
      payload.password = password;
    }

    try {
      const url =
        mode === 'edit'
          ? `http://localhost:8000/asset/v1/edit-asset/${existingData.asset_id}`
          : 'http://localhost:8000/asset/v1/add-asset';

      const result = await fetchWithAuth(url, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });

      if (result) {
        onAssetAdded(result);
        toast({
          title: mode === 'edit' ? "Asset updated" : "Asset added",
          description: mode === 'edit' ? "Asset updated successfully." : "New asset added successfully.",
          variant: "success",
        });

        if (mode === 'add') {
          setFormData({
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
          });
        }

        onClose();
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Submission failed",
        description: "Could not connect to the server or process the asset.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? `Update the configuration for ${existingData?.name}`
              : 'Add a new Linux server to your infrastructure.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Asset Name *</Label>
            <Input id="name" placeholder="web-server-01" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ip">IP Address *</Label>
            <Input
              id="ip"
              placeholder="192.168.1.10"
              value={formData.ip}
              onChange={(e) => {
                if (mode !== 'edit') {
                  handleInputChange('ip', e.target.value);
                }
              }}
              readOnly={mode === 'edit'}
              title={mode === 'edit' ? 'IP cannot be changed during edit' : ''}
              className={mode === 'edit' ? 'cursor-not-allowed bg-gray-100' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label>Technology *</Label>
            <Select value={formData.technology} onValueChange={(value) => handleInputChange('technology', value)}>
              <SelectTrigger><SelectValue placeholder="Select operating system" /></SelectTrigger>
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
            <Label htmlFor="username">Username *</Label>
            <Input id="username" placeholder="admin" value={formData.username} onChange={(e) => handleInputChange('username', e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{mode === 'edit' ? 'New Password' : 'Password'} {mode === 'edit' ? '(leave empty to keep unchanged)' : '*'}</Label>
            <Input id="password" type="password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password {formData.password && '*'}</Label>
            <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} />
          </div>

          <div className="space-y-3">
            <Label>Group Assignment *</Label>
            <Select value={formData.groupOption} onValueChange={(value) => handleInputChange('groupOption', value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="existing">Use Existing Group</SelectItem>
                <SelectItem value="new">Create New Group</SelectItem>
              </SelectContent>
            </Select>

            {formData.groupOption === 'existing' && (
              <Select value={formData.existingGroup} onValueChange={(value) => handleInputChange('existingGroup', value)}>
                <SelectTrigger><SelectValue placeholder="Select existing group" /></SelectTrigger>
                <SelectContent>
                  {dbGroups.map(group => (
                    <SelectItem key={group.name} value={group.name.trim()}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }} />
                        {group.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {formData.groupOption === 'new' && (
              <div className="space-y-3">
                <Input placeholder="Enter group name" value={formData.newGroupName} onChange={(e) => handleInputChange('newGroupName', e.target.value)} />
                <div className="space-y-2">
                  <Label>Group Color</Label>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded border-2 border-gray-300" style={{ backgroundColor: formData.newGroupColor }} />
                    <div className="grid grid-cols-8 gap-2">
                      {predefinedColors.map(color => (
                        <button key={color} type="button" className={`w-6 h-6 rounded border-2 ${formData.newGroupColor === color ? 'border-gray-700' : 'border-gray-300'}`} style={{ backgroundColor: color }} onClick={() => handleInputChange('newGroupColor', color)} />
                      ))}
                    </div>
                  </div>
                  <Input type="color" value={formData.newGroupColor} onChange={(e) => handleInputChange('newGroupColor', e.target.value)} className="w-20 h-8" />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{mode === 'edit' ? 'Save Changes' : 'Add Asset'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAssetForm;
