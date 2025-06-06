
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Plus, Edit, Trash2 } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  group?: string;
  asset?: string;
  date: string;
  type: 'journal' | 'asset';
}

interface Asset {
  id: string;
  name: string;
  ip: string;
  group: string;
  groupColor?: string;
}

const Blog = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([
    {
      id: '1',
      title: 'Server Maintenance Log',
      content: 'Performed routine maintenance on web-server-01. Updated packages and restarted services.',
      group: 'Web Servers',
      asset: 'web-server-01',
      date: '2024-01-15',
      type: 'asset'
    },
    {
      id: '2',
      title: 'Infrastructure Planning',
      content: 'Planning to upgrade our database servers next quarter. Need to evaluate new hardware options.',
      date: '2024-01-14',
      type: 'journal'
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'journal' as 'journal' | 'asset',
    group: '',
    asset: ''
  });

  // Mock data
  const assets: Asset[] = [
    { id: '1', name: 'web-server-01', ip: '192.168.1.10', group: 'Web Servers', groupColor: '#3b82f6' },
    { id: '2', name: 'db-server-01', ip: '192.168.1.20', group: 'Database Servers', groupColor: '#10b981' },
    { id: '3', name: 'app-server-01', ip: '192.168.1.30', group: 'Application Servers', groupColor: '#f59e0b' }
  ];

  const groups = [...new Set(assets.map(asset => asset.group))];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast({
        title: "Missing fields",
        description: "Please fill in title and content.",
        variant: "destructive",
      });
      return;
    }

    const newPost: BlogPost = {
      id: Date.now().toString(),
      title: formData.title,
      content: formData.content,
      type: formData.type,
      ...(formData.type === 'asset' && { group: formData.group, asset: formData.asset }),
      date: new Date().toISOString().split('T')[0]
    };

    setPosts(prev => [newPost, ...prev]);
    setFormData({ title: '', content: '', type: 'journal', group: '', asset: '' });
    setIsCreating(false);
    
    toast({
      title: "Post created",
      description: "Your blog post has been saved successfully.",
    });
  };

  const handleDelete = (id: string) => {
    setPosts(prev => prev.filter(post => post.id !== id));
    toast({
      title: "Post deleted",
      description: "Blog post has been deleted.",
    });
  };

  const filteredAssets = formData.group ? assets.filter(asset => asset.group === formData.group) : assets;

  return (
    <div className="space-y-4 animate-fade-in w-full -mt-64">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog & Journal</h1>
          <p className="text-muted-foreground">Document your infrastructure insights and daily operations</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Post</span>
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
            <CardDescription>Write about your infrastructure or create a journal entry</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter post title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Post Type</Label>
                <Select value={formData.type} onValueChange={(value: 'journal' | 'asset') => setFormData({ ...formData, type: value, group: '', asset: '' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="journal">General Journal</SelectItem>
                    <SelectItem value="asset">Asset Specific</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.type === 'asset' && (
                <>
                  <div className="space-y-2">
                    <Label>Group</Label>
                    <Select value={formData.group} onValueChange={(value) => setFormData({ ...formData, group: value, asset: '' })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select group" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map(group => (
                          <SelectItem key={group} value={group}>{group}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Asset</Label>
                    <Select value={formData.asset} onValueChange={(value) => setFormData({ ...formData, asset: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredAssets.map(asset => (
                          <SelectItem key={asset.id} value={asset.name}>
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: asset.groupColor || '#6b7280' }}
                              />
                              <span>{asset.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Write your post content here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="min-h-[200px]"
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit">Save Post</Button>
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{post.title}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                {post.type === 'asset' ? `${post.group} - ${post.asset}` : 'Journal Entry'} • {post.date}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Blog;
