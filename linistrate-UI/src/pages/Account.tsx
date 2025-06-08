import { useState } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import {
  User, Settings, Shield, Bell, Key, Activity, Calendar,
  Clock, Globe, Smartphone, Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';


const Account = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [autoLogout, setAutoLogout] = useState(true);
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deletionLoading, setDeletionLoading] = useState(false);
  const { toast } = useToast();
  const [passwordDeletion, setPasswordDeletion] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailUpdate = async () => {
  if (!isValidEmail(email)) {
    toast({
      title: "Invalid Email",
      description: "Please enter a valid email address.",
      variant: "destructive",
    });
    return;
  }

  try {
    setEmailLoading(true);
    const res = await fetch('http://localhost:8000/user/v1/update-user-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('linistrate_token')}`,
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to update email');

    toast({
      title: "Email Updated",
      description: "Your email has been updated successfully.",
      variant: "success",
    });
  } catch (err) {
    toast({
      title: "Email Update Failed",
      description: err.message || "An error occurred while updating email.",
      variant: "destructive",
    });
  } finally {
    setEmailLoading(false);
  }
};


  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }
    try {
      setPasswordLoading(true);
      const res = await fetch('http://localhost:8000/user/v1/update-user-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('linistrate_token')}`,
        },
        body: JSON.stringify({
          curpassword: currentPassword,
          newpassword: newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to update password');

      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
        variant: "success",
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast({
        title: "Password Update Failed",
        description: err.message || "An error occurred while updating password.",
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

const handleAcountDeletion = async () => {
  if (!passwordDeletion) {
    toast({
      title: "Error",
      description: "Please enter your password to delete the account.",
      variant: "destructive",
    });
    return;
  }

  try {
    setDeletionLoading(true);
    const res = await fetch("http://localhost:8000/user/v1/delete-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("linistrate_token")}`,
      },
      body: JSON.stringify({ password: passwordDeletion }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Account deletion failed.");

    toast({
      title: "Account Deleted",
      description: "Your account has been deleted successfully.",
      variant: "success",
    });

    localStorage.removeItem("linistrate_token");
    navigate('/dashboard')
  } catch (err) {
    toast({
      title: "Deletion Failed",
      description: err.message || "An error occurred while deleting the account.",
      variant: "destructive",
    });
  } finally {
    setDeletionLoading(false);
  }
};


  return (
  <div className="space-y-4 animate-fade-in w-full -mt-64">
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-3xl font-bold">{user?.name || 'User'}</h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile"><User className="h-4 w-4 mr-2" />Profile</TabsTrigger>
          <TabsTrigger value="security"><Shield className="h-4 w-4 mr-2" />Security</TabsTrigger>
          <TabsTrigger value="preferences"><Settings className="h-4 w-4 mr-2" />Preferences</TabsTrigger>
          <TabsTrigger value="activity"><Activity className="h-4 w-4 mr-2" />Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Username</Label>
                  <Input id="name" defaultValue={user?.name} readOnly className="cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <Button className="w-full" onClick={handleEmailUpdate} disabled={emailLoading}>
                  {emailLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
                <CardDescription>Your account overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">47</div>
                    <div className="text-sm text-muted-foreground">Commands Executed</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600">12</div>
                    <div className="text-sm text-muted-foreground">Assets Managed</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">99.2%</div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">6</div>
                    <div className="text-sm text-muted-foreground">Active Sessions</div>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Member since</span>
                  </div>
                  <span className="text-sm font-medium">{user?.memberSince || 'January 2024'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Last login</span>
                  </div>
                  <span className="text-sm font-medium">{user?.lastLogin || '2 hours ago'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                
                <CardDescription>Manage your login credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 relative">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type={showCurrentPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-[30px]"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-[30px]"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-[30px]"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
                <Button className="w-full" onClick={handlePasswordUpdate} disabled={passwordLoading}>
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </Button>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Two-Factor Authentication</Label>
                    <div className="text-sm text-muted-foreground">Add an extra layer of security</div>
                  </div>
                  <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Deletion</CardTitle>
                {/* <CardDescription>Manage your active sessions</CardDescription> */}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 relative">
                  <Label htmlFor="delete-password">Enter Password</Label>
                  <Input id="delete-password" type={showDeletePassword ? 'text' : 'password'} value={passwordDeletion} onChange={(e) => setPasswordDeletion(e.target.value)} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-[30px]"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                  >
                    {showDeletePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
                <Button className="w-full" onClick={handleAcountDeletion} disabled={deletionLoading}>
                  {deletionLoading ? 'Deleting...' : 'Delete Account'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Receive email updates about your account
                  </div>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              <Separator />
              <div className="space-y-3">
                <Label className="text-base">Notification Types</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">Command execution results</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4" />
                      <span className="text-sm">System alerts</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm">Asset status changes</span>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent actions and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Command executed successfully</div>
                    <div className="text-xs text-muted-foreground">System Information on web-server-01 • 2 hours ago</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">New asset added</div>
                    <div className="text-xs text-muted-foreground">app-server-02 added to Application Servers • 1 day ago</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Password changed</div>
                    <div className="text-xs text-muted-foreground">Account password updated • 3 days ago</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Login from new device</div>
                    <div className="text-xs text-muted-foreground">Mobile app login detected • 1 week ago</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Account;