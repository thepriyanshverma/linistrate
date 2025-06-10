'use client';

import { useEffect, useState } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Play, Upload, Clock, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const Commands = () => {
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState('');
  const [selectedTechnology, setSelectedTechnology] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedScript, setSelectedScript] = useState('');
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');

  // Upload Dialog
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [customScriptName, setCustomScriptName] = useState('');
  const [customScriptContent, setCustomScriptContent] = useState('');
  const [customScriptDescription, setCustomScriptDescription] = useState('');

  // Scheduling
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>();
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleRepeat, setScheduleRepeat] = useState('once');
  const [scheduleDays, setScheduleDays] = useState('');
  const [scheduleEmail, setScheduleEmail] = useState('');

  useEffect(() => {
    // Simulate fetching assets
    setAssets([
      { id: '1', name: 'Asset 1', ip: '10.0.0.1', technology: 'linux', groupColor: '#10b981' },
      { id: '2', name: 'Asset 2', ip: '10.0.0.2', technology: 'windows', groupColor: '#f97316' },
    ]);
  }, []);

  const getAvailableTechnologies = () => ['linux', 'windows', 'docker', 'kubernetes'];
  const getAvailableCategories = () => ['maintenance', 'monitoring', 'deployment'];
  const getAvailableScripts = () => [
    { value: 'disk-check', label: 'Disk Check', description: 'Checks disk usage' },
    { value: 'nginx-restart', label: 'Restart Nginx', description: 'Restarts the Nginx service' },
    { value: 'custom-upload', label: customScriptName, description: customScriptDescription, isCustom: true },
  ];

  const handleAssetChange = (value: string) => {
    setSelectedAsset(value);
    const tech = assets.find(a => a.id === value)?.technology || '';
    setSelectedTechnology(tech);
    setSelectedCategory('');
    setSelectedScript('');
  };

  const handleUploadScript = () => {
    console.log('Uploaded Script:', {
      name: customScriptName,
      tech: selectedTechnology,
      category: selectedCategory,
      content: customScriptContent,
      description: customScriptDescription
    });
    setIsUploadDialogOpen(false);
  };

  const handleExecute = () => {
    const usedCommand = selectedScript
      ? `Executing script: ${selectedScript}`
      : command;

    setOutput(`Running on ${selectedAsset}: ${usedCommand}`);
  };

  const handleSchedule = () => {
    const datetime = scheduleDate ? format(scheduleDate, 'PPP') + ' at ' + scheduleTime : '';
    console.log('Scheduled:', {
      asset: selectedAsset,
      script: selectedScript,
      command,
      datetime,
      repeat: scheduleRepeat,
      days: scheduleDays,
      email: scheduleEmail
    });
  };

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <div>Command Center</div>
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
                        value={customScriptName}
                        onChange={(e) => setCustomScriptName(e.target.value)}
                        placeholder="My Custom Script"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Technology</Label>
                      <Select value={selectedTechnology} onValueChange={setSelectedTechnology}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select technology" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableTechnologies().map(tech => (
                            <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                          ))}
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
                        {getAvailableCategories().map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={customScriptDescription}
                      onChange={(e) => setCustomScriptDescription(e.target.value)}
                      placeholder="Brief description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Script Content</Label>
                    <Textarea
                      value={customScriptContent}
                      onChange={(e) => setCustomScriptContent(e.target.value)}
                      placeholder="#!/bin/bash&#10;echo Hello World"
                      className="min-h-[150px] font-mono"
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleUploadScript}
                    disabled={!customScriptName || !selectedTechnology || !selectedCategory}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Script
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription>
            Execute custom commands or predefined scripts
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
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
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.groupColor }} />
                      <span>{asset.name}</span>
                      <span className="text-muted-foreground">({asset.ip})</span>
                      <span className="text-xs text-muted-foreground">{asset.technology}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Script Category</Label>
            <Select value={selectedCategory} onValueChange={(val) => {
              setSelectedCategory(val);
              setSelectedScript('');
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a script category" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableCategories().map(cat => (
                  <SelectItem key={cat} value={cat}>
                    <div className="flex items-center space-x-2">
                      <span className="capitalize">{cat}</span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          <div className="text-center text-sm text-muted-foreground">OR</div>

          <div className="space-y-2">
            <Label htmlFor="command">Custom Command</Label>
            <Input
              id="command"
              placeholder="ls -la"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              disabled={!!selectedScript}
            />
            <p className="text-xs text-muted-foreground">Disabled when script is selected</p>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleExecute} disabled={!selectedAsset || (!command && !selectedScript)} className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              Execute Now
            </Button>
            <Button variant="outline" onClick={() => setIsScheduling(!isScheduling)} disabled={!selectedAsset || (!command && !selectedScript)}>
              <Clock className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </div>

          {isScheduling && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
              <h3 className="font-medium">Schedule Execution</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Execution Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !scheduleDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduleDate ? format(scheduleDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={scheduleDate} onSelect={setScheduleDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Execution Time</Label>
                  <Input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
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
                    <Label>{scheduleRepeat === 'daily' ? 'For Days' : scheduleRepeat === 'weekly' ? 'For Weeks' : 'For Months'}</Label>
                    <Input type="number" min="1" max="365" value={scheduleDays} onChange={(e) => setScheduleDays(e.target.value)} />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Email for Results</Label>
                <Input type="email" placeholder="user@example.com" value={scheduleEmail} onChange={(e) => setScheduleEmail(e.target.value)} />
              </div>

              <Button className="w-full" onClick={handleSchedule} disabled={!scheduleDate || !scheduleTime || !scheduleEmail}>
                <Clock className="h-4 w-4 mr-2" />
                Schedule Execution
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Command Output</CardTitle>
          <CardDescription>Real-time output from command execution</CardDescription>
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
  );
};

export default Commands;
