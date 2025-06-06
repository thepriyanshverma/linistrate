
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';


interface AddAssetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetAdded: (asset: any) => void;
}


//neeche wala maine edit kiya
const submitAssetToBackend = async (assetData: any, fetchWithAuth: (input: RequestInfo, init?: RequestInit) => Promise<any>) => {
  try {
    const data = await fetchWithAuth('http://localhost:8000/asset/v1/add-asset', {
      method: 'POST',
      body: JSON.stringify(assetData),
    });
    return data;
  } catch (error) {
    console.error('Error submitting asset:', error);
    return null;
  }
};


//yaha tak
const AddAssetForm = ({ isOpen, onClose, onAssetAdded }: AddAssetFormProps) => {
  const { toast } = useToast();
  const { fetchWithAuth } = useAuth(); // ✅ Access fetchWithAuth
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
    newGroupColor: '#3b82f6'
  });
  


interface AddAssetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetAdded: (asset: any) => void;
}


//neeche wala maine edit kiya
const submitAssetToBackend = async (assetData: any, fetchWithAuth: (input: RequestInfo, init?: RequestInit) => Promise<any>) => {
  try {
    const data = await fetchWithAuth('http://localhost:8000/asset/v1/add-asset', {
      method: 'POST',
      body: JSON.stringify(assetData),
    });
    return data;
  } catch (error) {
    console.error('Error submitting asset:', error);
    return null;
  }
};

const [dbGroups, setDbGroups] = useState<{ name: string; color: string }[]>([]);

useEffect(() => {
  const fetchGroups = async () => {
    try {
      const res = await fetchWithAuth("http://localhost:8000/group/v1/get-groups");
      setDbGroups(res); // assuming the response is an array of { name, color }
    } catch (err) {
      console.error("Failed to fetch groups", err);
    }
  };

  if (isOpen) {
    fetchGroups();
  }
}, [isOpen]);

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

  const existingGroups = [
    'Web Servers',
    'Database Servers',
    'Application Servers',
    'Cache Servers',
    'Load Balancers',
    'Monitoring Servers'
  ];

  const predefinedColors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // yellow
    '#8b5cf6', // purple
    '#ef4444', // red
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
  ];

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.name || !formData.ip || !formData.technology || !formData.username || !formData.password || !formData.confirmPassword) {
    toast({
      title: "Missing fields",
      description: "Please fill in all required fields.",
      variant: "destructive",
    });
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    toast({
      title: "Password mismatch",
      description: "Passwords do not match. Please try again.",
      variant: "destructive",
    });
    return;
  }

  if (formData.groupOption === 'existing' && !formData.existingGroup) {
    toast({
      title: "Group required",
      description: "Please select an existing group.",
      variant: "destructive",
    });
    return;
  }

  if (formData.groupOption === 'new' && !formData.newGroupName) {
    toast({
      title: "Group name required",
      description: "Please enter a name for the new group.",
      variant: "destructive",
    });
    return;
  }

const groupName = formData.groupOption === 'existing'
  ? formData.existingGroup
  : formData.newGroupName;

const groupColor = formData.groupOption === 'existing'
  ? undefined
  : formData.newGroupColor;

const newAsset: any = {
  name: formData.name,
  ip: formData.ip,
  technology: formData.technology,
  username: formData.username,
  password: formData.password,
  group: groupName,
  ...(groupColor && { group_color: groupColor }) // Only include group_color if defined
};


const createdAsset = await submitAssetToBackend(newAsset, fetchWithAuth);
  if (createdAsset) {
    onAssetAdded(createdAsset);
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
      newGroupColor: '#3b82f6'
    });
    onClose();
  toast({
    title: "Asset added",
    description: "New asset has been successfully added.",
  });
} else {
  toast({
    title: "Submission failed",
    description: "Could not connect to the server or add asset.",
    variant: "destructive",
  });
}
};
const handleInputChange = (field: string, value: string) => {
  setFormData(prev => ({ ...prev, [field]: value }));
};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
          <DialogDescription>
            Add a new Linux server to your infrastructure.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Asset Name *</Label>
            <Input
              id="name"
              placeholder="web-server-01"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ip">IP Address *</Label>
            <Input
              id="ip"
              placeholder="192.168.1.10"
              value={formData.ip}
              onChange={(e) => handleInputChange('ip', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Technology *</Label>
            <Select value={formData.technology} onValueChange={(value) => handleInputChange('technology', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select operating system" />
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
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              placeholder="admin"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>Group Assignment *</Label>
            <Select value={formData.groupOption} onValueChange={(value) => handleInputChange('groupOption', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="existing">Use Existing Group</SelectItem>
                <SelectItem value="new">Create New Group</SelectItem>
              </SelectContent>
            </Select>

            {formData.groupOption === 'existing' && (
              <Select value={formData.existingGroup} onValueChange={(value) => handleInputChange('existingGroup', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select existing group" />
                </SelectTrigger>
                <SelectContent>
                  {dbGroups.map(group => (
                  <SelectItem key={group.name} value={group.name}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      {group.name}
                    </div>
                  </SelectItem>
                ))}
                </SelectContent>
              </Select>
            )}

            {formData.groupOption === 'new' && (
              <div className="space-y-3">
                <Input
                  placeholder="Enter group name"
                  value={formData.newGroupName}
                  onChange={(e) => handleInputChange('newGroupName', e.target.value)}
                />
                <div className="space-y-2">
                  <Label>Group Color</Label>
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded border-2 border-gray-300"
                      style={{ backgroundColor: formData.newGroupColor }}
                    />
                    <div className="grid grid-cols-8 gap-2">
                      {predefinedColors.map(color => (
                        <button
                          key={color}
                          type="button"
                          className={`w-6 h-6 rounded border-2 ${formData.newGroupColor === color ? 'border-gray-700' : 'border-gray-300'}`}
                          style={{ backgroundColor: color }}
                          onClick={() => handleInputChange('newGroupColor', color)}
                        />
                      ))}
                    </div>
                  </div>
                  <Input
                    type="color"
                    value={formData.newGroupColor}
                    onChange={(e) => handleInputChange('newGroupColor', e.target.value)}
                    className="w-20 h-8"
                  />
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Asset
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAssetForm;
