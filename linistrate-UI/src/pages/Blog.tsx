// Blog.tsx
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from "@/components/ui/dialog";

interface BlogPost {
  id: number;
  title: string;
  content: string;
  group?: string;
  groupColor?: string;
  asset?: string;
  assetIp?: string;
  date: string;
  type: 'journal' | 'asset';
}

interface Asset {
  id: number;
  name: string;
  ip: string;
  group: string;
  groupColor: string;
}

interface Group {
  name: string;
  color: string;
}

const Blog = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'journal' as 'journal' | 'asset',
    group: '',
    asset: '',
    assetIp: '',
    groupColor: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('linistrate_token');
    if (!token) return;

    const fetchData = async () => {
      try {
        const [assetRes, groupRes, blogRes] = await Promise.all([
          fetch('http://localhost:8000/asset/v1/get-assets', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:8000/group/v1/get-groups', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:8000/blog/v1/get-blogs', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (assetRes.ok) {
          const data = await assetRes.json();
          setAssets(data.map((a: any) => ({
            id: a.asset_id,
            name: a.name,
            ip: a.ip,
            group: a.group_r.name,
            groupColor: a.group_r.color,
          })));
        }

        if (groupRes.ok) setGroups(await groupRes.json());

        if (blogRes.ok) {
          const blogs = await blogRes.json();
          setPosts(blogs.map((b: any) => {
            const matchedAsset = b.asset_id && assets.find(a => a.id === b.asset_id);
            return {
              id: b.blog_id,
              title: b.blog_title,
              content: b.blog_content,
              type: b.asset_id ? 'asset' : 'journal',
              group: matchedAsset?.group || '',
              groupColor: matchedAsset?.groupColor || '',
              asset: matchedAsset?.name || '',
              assetIp: matchedAsset?.ip || '',
              date: b.blog_created_at
                    ? new Date(new Date(b.blog_created_at).getTime() + (5.5 * 60 * 60 * 1000)) // UTC to IST
                        .toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                    : new Date().toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }),
            };
          }));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('linistrate_token');
    if (!formData.title || !formData.content || !token) {
      toast({ title: 'Missing fields', description: 'Please fill in title and content.', variant: 'destructive' });
      return;
    }

    const selectedAsset = assets.find((a) => a.name === formData.asset);
    const payload = {
      blog_title: formData.title,
      blog_content: formData.content,
      asset_post_type: formData.type === 'asset',
      asset_id: selectedAsset?.id ?? null,
    };

    try {
      const endpoint = isEditing
        ? `http://localhost:8000/blog/v1/edit-blog/${editingId}`
        : 'http://localhost:8000/blog/v1/create-blog';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error((await response.json()).message);

      const newPost: BlogPost = {
        id: isEditing ? editingId! : Date.now(),
        title: formData.title,
        content: formData.content,
        type: formData.type,
        group: selectedAsset?.group,
        groupColor: selectedAsset?.groupColor,
        asset: selectedAsset?.name,
        assetIp: selectedAsset?.ip,
        date: new Date().toISOString().split('T')[0],
      };

      setPosts(prev =>
        isEditing
          ? prev.map(p => (p.id === editingId ? newPost : p))
          : [newPost, ...prev]
      );

      toast({ title: isEditing ? 'Post updated' : 'Post created', description: 'Saved successfully.', variant: 'success' });

      setFormData({
        title: '',
        content: '',
        type: 'journal',
        group: '',
        asset: '',
        assetIp: '',
        groupColor: '',
      });
      setIsCreating(false);
      setIsEditing(false);
      setEditingId(null);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('linistrate_token');
    try {
      const res = await fetch(`http://localhost:8000/blog/v1/delete-blog/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete blog");

      setPosts(prev => prev.filter(p => p.id !== id));
      toast({ title: 'Deleted', description: 'Post removed.', variant: 'success' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (id: number) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    setFormData({
      title: post.title,
      content: post.content,
      type: post.type,
      group: post.group || '',
      asset: post.asset || '',
      assetIp: post.assetIp || '',
      groupColor: post.groupColor || '',
    });

    setEditingId(id);
    setIsEditing(true);
    setIsCreating(true);
  };

  const filteredAssets = formData.group
    ? assets.filter(a => a.group === formData.group)
    : assets;

  return (
    <div className="space-y-4 animate-fade-in w-full -mt-64">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog & Journal</h1>
          <p className="text-muted-foreground">Document your infrastructure insights and daily operations</p>
        </div>
        {!isCreating && (
          <Button onClick={() => {
            setFormData({
              title: '',
              content: '',
              type: 'journal',
              group: '',
              asset: '',
              assetIp: '',
              groupColor: '',
            });
            setIsCreating(true);
          }}>
            <Plus className="h-4 w-4 mr-2" /> New Post
          </Button>
        )}
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Post' : 'Create New Post'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label>Post Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'journal' | 'asset') => setFormData({ ...formData, type: value, group: '', asset: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="journal">General Journal</SelectItem>
                    <SelectItem value="asset">Asset Specific</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Asset fields */}
              {formData.type === 'asset' && (
                <>
                  <div className="space-y-2">
                    <Label>Group</Label>
                    <Select
                      value={formData.group}
                      onValueChange={(value) => setFormData({ ...formData, group: value, asset: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select group" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((g) => (
                          <SelectItem key={g.name} value={g.name}>{g.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Asset</Label>
                    <Select
                      value={formData.asset}
                      onValueChange={(value) => {
                        const asset = assets.find(a => a.name === value);
                        setFormData({
                          ...formData,
                          asset: value,
                          assetIp: asset?.ip || '',
                          groupColor: asset?.groupColor || '',
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredAssets.map((asset) => (
                          <SelectItem key={asset.id} value={asset.name}>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.groupColor }} />
                              <span>{asset.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea id="content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="min-h-[200px]" />
              </div>

              {/* Buttons */}
              <div className="flex space-x-2">
                <Button type="submit">{isEditing ? 'Update Post' : 'Save Post'}</Button>
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreating(false);
                  setIsEditing(false);
                  setEditingId(null);
                  setFormData({
                    title: '',
                    content: '',
                    type: 'journal',
                    group: '',
                    asset: '',
                    assetIp: '',
                    groupColor: '',
                  });
                }}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Blog cards */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <DialogTrigger asChild key={post.id}>
              <Card onClick={() => setSelectedPost(post)} className="cursor-pointer hover:shadow-lg transition">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {post.groupColor && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: post.groupColor }} />}
                      <CardTitle>{post.title}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(post.id); }}>Edit</Button>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(post.id); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    {post.type === 'asset'
                      ? `${post.group} • ${post.asset} (${post.assetIp})`
                      : 'Journal Entry'} • {post.date}
                  </CardDescription>
                </CardHeader>
                  <CardContent>
                <div className="text-sm text-muted-foreground line-clamp-3">
                  <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>
              </CardContent>
              </Card>
            </DialogTrigger>
          ))}
        </div>

        {selectedPost && (
  <DialogContent
    className="max-w-2xl max-h-[80vh] overflow-y-auto p-6"
  >
    <DialogHeader>
      <DialogTitle>{selectedPost.title}</DialogTitle>
      <DialogDescription>
        {selectedPost.type === 'asset'
          ? `${selectedPost.group} • ${selectedPost.asset} (${selectedPost.assetIp})`
          : 'Journal Entry'} • {selectedPost.date}
      </DialogDescription>
    </DialogHeader>
    <div className="prose prose-sm dark:prose-invert mt-2 max-w-none">
      <ReactMarkdown>{selectedPost.content}</ReactMarkdown>
    </div>
  </DialogContent>
)}

      </Dialog>
    </div>
  );
};

export default Blog;
