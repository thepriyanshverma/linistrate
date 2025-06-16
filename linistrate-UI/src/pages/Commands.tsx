import { useState , useEffect} from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarIcon, Play, Clock, Terminal, ChevronRight, Upload, Plus, FolderPlus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Group {
  name: string;
  color: string;
}

interface Technology {
  technology_id: number;
  name: string;
}

interface Asset {
  asset_id: number;
  name: string;
  ip: string;
  username: string;
  technology: number;
  status: 'online' | 'offline' | 'maintenance';
  group_r?: Group;
}

interface Script {
  value: string;
  label: string;
  description: string;
  isCustom?: boolean;
}

interface ScriptCategory {
  [key: string]: {
    [subcategory: string]: Script[];
  };
}

const Commands = () => {
  const [command, setCommand] = useState('');
  const [selectedScript, setSelectedScript] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [selectedTechnology, setSelectedTechnology] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [output, setOutput] = useState('');
  const [scheduleDate, setScheduleDate] = useState<Date>();
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleEmail, setScheduleEmail] = useState('');
  const [scheduleRepeat, setScheduleRepeat] = useState('once');
  const [scheduleDays, setScheduleDays] = useState('1');
  const [isScheduling, setIsScheduling] = useState(false);
  const [technologies, setTechnologies] = useState<{ technology_id: string; name: string }[]>([]);


  // Custom script/category states
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [customScriptName, setCustomScriptName] = useState('');
  const [customScriptDescription, setCustomScriptDescription] = useState('');
  const [customScriptContent, setCustomScriptContent] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryTechnology, setNewCategoryTechnology] = useState('');
  
  // State for custom scripts and categories
  const [customScripts, setCustomScripts] = useState<ScriptCategory>({});

  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
  const fetchTechnologies = async () => {
    const token = localStorage.getItem('linistrate_token');
    try {
      const res = await fetch('http://localhost:8000/technology/v1/get-technologies', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setTechnologies(data);
    } catch (err) {
      console.error("Failed to fetch technologies", err);
    }
  };

  fetchTechnologies();
}, []);

  useEffect(() => {
      const fetchAssets = async () => {
        const token = localStorage.getItem('linistrate_token');
        if (!token) {
          console.error("No token found");
          return;
        }
  
        try {
          const res = await fetch('http://localhost:8000/asset/v1/get-assets', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          const data = await res.json();
          console.log("Asset response:", data);
  
          if (Array.isArray(data)) {
            const mapped = data.map((item: any) => ({
            id: item.asset_id.toString(),
            name: item.name,
            ip: item.ip,
            technology: item.technology, // ✅ Add this line
            group: item.group_r?.name ?? 'N/A',
            groupColor: item.group_r?.color ?? '#6b7280',
            status: 'online',
          }));
            setAssets(mapped);
          }
        } catch (error) {
          console.error('Failed to fetch assets:', error);
        }
      };
  
      fetchAssets();
    }, []);
  
  const [scriptCategories, setScriptCategory] = useState<ScriptCategory[]>([]);
  
const getAvailableTechnologies = () => {
  if (!selectedAsset) return [];
  const asset = assets.find(a => a.id === selectedAsset);
  const techName = asset ? (technologies.find(t => t.technology_id === asset.technology)?.name || 'Unknown') : '';
  return asset ? [asset.technology] : [];
};


  const getAvailableCategories = () => {
    if (!selectedTechnology || !scriptCategories[selectedTechnology]) return [];
    return Object.keys(scriptCategories[selectedTechnology]);
  };

  const getAvailableScripts = () => {
    if (!selectedTechnology || !selectedCategory || !scriptCategories[selectedTechnology]?.[selectedCategory]) {
      return [];
    }
    return scriptCategories[selectedTechnology][selectedCategory];
  };

  const handleAssetChange = (assetId: string) => {
    setSelectedAsset(assetId);
    setSelectedTechnology('');
    setSelectedCategory('');
    setSelectedScript('');
    
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      setSelectedTechnology(asset.technology);
    }
  };

  // Custom script upload handler
  const handleUploadScript = () => {
    if (!customScriptName || !selectedTechnology || !selectedCategory) return;
    
    const newScript: Script = {
      value: `custom_${Date.now()}`,
      label: customScriptName,
      description: customScriptDescription,
      isCustom: true
    };

    setCustomScripts(prev => {
      const updated = { ...prev };
      if (!updated[selectedTechnology]) updated[selectedTechnology] = {};
      if (!updated[selectedTechnology][selectedCategory]) updated[selectedTechnology][selectedCategory] = [];
      updated[selectedTechnology][selectedCategory].push(newScript);
      return updated;
    });

    setCustomScriptName('');
    setCustomScriptDescription('');
    setCustomScriptContent('');
    setIsUploadDialogOpen(false);
    setOutput(`Custom script "${newScript.label}" uploaded successfully to ${selectedTechnology}/${selectedCategory}`);
  };

  // Create category handler
  const handleCreateCategory = () => {
    if (!newCategoryName || !newCategoryTechnology) return;

    setCustomScripts(prev => {
      const updated = { ...prev };
      if (!updated[newCategoryTechnology]) updated[newCategoryTechnology] = {};
      if (!updated[newCategoryTechnology][newCategoryName.toLowerCase()]) {
        updated[newCategoryTechnology][newCategoryName.toLowerCase()] = [];
      }
      return updated;
    });

    setNewCategoryName('');
    setNewCategoryTechnology('');
    setIsCategoryDialogOpen(false);
    setOutput(`Custom category "${newCategoryName}" created for ${newCategoryTechnology}`);
  };

const handleExecute = async () => {
    if (!selectedAsset) {
      return setOutput('Error: Please select a target asset.');
    }

    const token = localStorage.getItem('linistrate_token');
    if (!token) {
      return setOutput('Error: Authorization token missing.');
    }

    try {
      // Fetch assets fresh (if needed), or rely on state assets:
      // Here you can skip fetching assets again unless you want to refresh

      // Prepare command
      let executionCommand = '';
      if (selectedScript) {
        const script = predefinedScripts.find(s => s.value === selectedScript);
        executionCommand = script ? script.value : selectedScript;
      } else if (command) {
        executionCommand = command;
      } else {
        return setOutput('Error: Enter a command or select a script.');
      }

      const asset = assets.find(a => a.id === selectedAsset);
      if (!asset) return setOutput('Error: Invalid asset selection.');

      setOutput(`Executing "${executionCommand}" on ${asset.name} (${asset.ip})...\nPlease wait...`);

      const res = await fetch('http://localhost:8000/command/v1/command-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ip: asset.ip,
          command: executionCommand,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Execution failed');

      if (data.error) {
        setOutput(`Error: ${data.error}`);
      } else {
        setOutput(Array.isArray(data.output) ? data.output.join('\n') : data.output);
      }
    } catch (error: any) {
      console.error(error);
      setOutput(`Execution failed: ${error.message}`);
    }
  };

  const handleSchedule = () => {
    if (!selectedAsset || !scheduleDate || !scheduleTime || !scheduleEmail) {
      setOutput('Error: Please select asset, date, time, and email for scheduling.');
      return;
    }

    if (!selectedScript && !command) {
      setOutput('Error: Please select a script or enter a command to schedule.');
      return;
    }

    const asset = assets.find(a => a.id === selectedAsset);
    let scheduledCommand = '';
    if (selectedScript) {
      const availableScripts = getAvailableScripts();
      const script = availableScripts.find(s => s.value === selectedScript);
      scheduledCommand = script ? script.label : selectedScript;
    } else {
      scheduledCommand = command;
    }

    const repeatInfo = scheduleRepeat === 'once' ? 'once' : 
                     scheduleRepeat === 'daily' ? `daily for ${scheduleDays} days` :
                     scheduleRepeat === 'weekly' ? `weekly for ${scheduleDays} weeks` :
                     `monthly for ${scheduleDays} months`;

    setOutput(`Scheduled "${scheduledCommand}" on ${asset?.name} for ${format(scheduleDate, 'PPP')} at ${scheduleTime}.\nRepeat: ${repeatInfo}\nResults will be sent to: ${scheduleEmail}\n\nSchedule ID: SCH-${Date.now()}`);
    setScheduleDate(undefined);
    setScheduleTime('');
    setScheduleEmail('');
    setScheduleDays('1');
    setIsScheduling(false);
  };

  return (
    <div className="space-y-4 animate-fade-in w-full -mt-64">
      <div>
        <h1 className="text-3xl font-bold">Command Execution</h1>
        <p className="text-muted-foreground">Execute commands and scripts on your assets</p>
      </div>

      <div className="space-y-6">
        {/* Command Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="h-5 w-5" />
                <span>Command Center</span>
              </div>
              <div className="flex space-x-2">
                <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <FolderPlus className="h-4 w-4 mr-2" />
                      Create Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Custom Category</DialogTitle>
                      <DialogDescription>
                        Create a new category for organizing your scripts
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="categoryName">Category Name</Label>
                        <Input
                          id="categoryName"
                          placeholder="e.g., monitoring"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Technology</Label>
                        <Select value={newCategoryTechnology} onValueChange={setNewCategoryTechnology}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select technology" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="linux">Linux</SelectItem>
                            <SelectItem value="windows">Windows</SelectItem>
                            <SelectItem value="docker">Docker</SelectItem>
                            <SelectItem value="kubernetes">Kubernetes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        onClick={handleCreateCategory}
                        disabled={!newCategoryName || !newCategoryTechnology}
                        className="w-full"
                      >
                        Create Category
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Script
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Upload Custom Script</DialogTitle>
                      <DialogDescription>
                        Upload your own script to be used in command execution
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="scriptName">Script Name</Label>
                          <Input
                            id="scriptName"
                            placeholder="My Custom Script"
                            value={customScriptName}
                            onChange={(e) => setCustomScriptName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Technology</Label>
                          <Select value={selectedTechnology} onValueChange={setSelectedTechnology}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select technology" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="linux">Linux</SelectItem>
                              <SelectItem value="windows">Windows</SelectItem>
                              <SelectItem value="docker">Docker</SelectItem>
                              <SelectItem value="kubernetes">Kubernetes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableCategories().map(category => (
                              <SelectItem key={category} value={category}>
                                <span className="capitalize">{category}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="scriptDescription">Description</Label>
                        <Input
                          id="scriptDescription"
                          placeholder="Brief description of what this script does"
                          value={customScriptDescription}
                          onChange={(e) => setCustomScriptDescription(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="scriptContent">Script Content</Label>
                        <Textarea
                          id="scriptContent"
                          placeholder="#!/bin/bash&#10;echo 'Hello World'"
                          className="min-h-[150px] font-mono"
                          value={customScriptContent}
                          onChange={(e) => setCustomScriptContent(e.target.value)}
                        />
                      </div>

                      <Button 
                        onClick={handleUploadScript}
                        disabled={!customScriptName || !selectedTechnology || !selectedCategory}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Script
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardTitle>
            <CardDescription>
              Execute custom commands or predefined scripts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Target Asset Selection */}
            <div className="space-y-2">
              <Label>Target Asset *</Label>
              <Select value={selectedAsset} onValueChange={handleAssetChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target asset" />
                </SelectTrigger>
                <SelectContent>
                  {assets.map(asset => (
                    <SelectItem key={asset.id} value={asset.id}>
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: asset.groupColor || '#6b7280' }}
                        />
                        <span>{asset.name}</span>
                        <span className="text-muted-foreground">({asset.ip})</span>
                        {/* <span className="text-xs text-muted-foreground">{asset.technology}</span> */}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Technology Selection */}
            
            {selectedAsset && (
            <div className="space-y-2">
              <Label>Asset Technology</Label>

              {/* Show the techName here */}
              <div className="text-sm text-muted-foreground">
                <strong>Detected:</strong>{' '}
                {(() => {
                  const asset = assets.find(a => a.id === selectedAsset);
                  return asset
                    ? technologies.find(t => t.technology_id === asset.technology)?.name || 'Unknown'
                    : '';
                })()}
              </div>

              {/* <Select
                value={selectedTechnology}
                onValueChange={(value) => {
                  setSelectedTechnology(value);
                  setSelectedCategory('');
                  setSelectedScript('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Technology auto-selected based on asset" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableTechnologies().map((techId) => (
                    <SelectItem key={techId} value={techId}>
                      {
                        technologies.find(t => t.technology_id === techId)?.name || techId
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select> */}
            </div>
          )}


            {/* Category Selection */}
            {selectedTechnology && (
              <div className="space-y-2">
                <Label>Script Category</Label>
                <Select value={selectedCategory} onValueChange={(value) => {
                  setSelectedCategory(value);
                  setSelectedScript('');
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a script category" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableCategories().map(category => (
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center space-x-2">
                          <span className="capitalize">{category}</span>
                          <ChevronRight className="h-3 w-3" />
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Script Selection */}
            {selectedCategory && (
              <div className="space-y-2">
                <Label>Predefined Script</Label>
                <Select value={selectedScript} onValueChange={setSelectedScript}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a script" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableScripts().map(script => (
                      <SelectItem key={script.value} value={script.value}>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{script.label}</span>
                            {script.isCustom && <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">Custom</span>}
                          </div>
                          <div className="text-xs text-muted-foreground">{script.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground">OR</div>

            {/* Custom Command Input */}
            <div className="space-y-2">
              <Label htmlFor="command">Custom Command</Label>
              <Input
                id="command"
                placeholder="ls -la"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                disabled={!!selectedScript}
              />
              <p className="text-xs text-muted-foreground">
                Custom commands are disabled when a script is selected
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button 
                onClick={handleExecute} 
                disabled={!selectedAsset || (!command && !selectedScript)}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                Execute Now
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsScheduling(!isScheduling)}
                disabled={!selectedAsset || (!command && !selectedScript)}
              >
                <Clock className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </div>

            {/* Enhanced Scheduling Section */}
            {isScheduling && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <h3 className="font-medium">Schedule Execution</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Execution Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !scheduleDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {scheduleDate ? format(scheduleDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={scheduleDate}
                          onSelect={setScheduleDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scheduleTime">Execution Time</Label>
                    <Input
                      id="scheduleTime"
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Repeat</Label>
                    <Select value={scheduleRepeat} onValueChange={setScheduleRepeat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">Once</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {scheduleRepeat !== 'once' && (
                    <div className="space-y-2">
                      <Label htmlFor="scheduleDays">
                        {scheduleRepeat === 'daily' ? 'For Days' : 
                         scheduleRepeat === 'weekly' ? 'For Weeks' : 'For Months'}
                      </Label>
                      <Input
                        id="scheduleDays"
                        type="number"
                        min="1"
                        max="365"
                        value={scheduleDays}
                        onChange={(e) => setScheduleDays(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduleEmail">Email for Results</Label>
                  <Input
                    id="scheduleEmail"
                    type="email"
                    placeholder="user@example.com"
                    value={scheduleEmail}
                    onChange={(e) => setScheduleEmail(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleSchedule}
                  disabled={!scheduleDate || !scheduleTime || !scheduleEmail}
                  className="w-full"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule Execution
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Command Output</CardTitle>
            <CardDescription>
              Real-time output from command execution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              placeholder="Command output will appear here..."
              className="min-h-[300px] font-mono text-sm bg-black text-green-400 border-gray-600"
              readOnly
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Commands;