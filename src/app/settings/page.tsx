'use client';

import React from 'react';
import { useSettings } from '@/context/settings-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { folderConfig } from '@/lib/folder-config';

export default function SettingsPage() {
  const { settings, updateSettings, getInitialTimeRange } = useSettings();

  const handleTimeCheckToggle = (checked: boolean) => {
    updateSettings({ timeCheckEnabled: checked });
  };

  const handleTimeChange = (id: string, part: 'start' | 'end', value: string) => {
    const numericValue = parseInt(value, 10);
    if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 23) {
      updateSettings({
        timeRanges: {
          ...settings.timeRanges,
          [id]: {
            ...settings.timeRanges[id],
            [part]: numericValue,
          },
        },
      });
    }
  };

  const timeRelevantConfigs = folderConfig.filter(config => getInitialTimeRange(config.id));

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Settings</CardTitle>
          <CardDescription>Manage your validation preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="time-check-switch" className="text-lg font-medium">
                Enable Time-Based Validation
              </Label>
              <p className="text-sm text-muted-foreground">
                When enabled, photos for certain categories will be checked against specific time ranges.
              </p>
            </div>
            <Switch
              id="time-check-switch"
              checked={settings.timeCheckEnabled}
              onCheckedChange={handleTimeCheckToggle}
            />
          </div>

          {settings.timeCheckEnabled && (
            <div className="space-y-4">
              <Separator />
              <h3 className="text-xl font-semibold">Time Ranges (24-hour format)</h3>
              <div className="space-y-6">
                {timeRelevantConfigs.map(config => (
                  <div key={config.id} className="p-4 border rounded-lg space-y-3">
                    <h4 className="font-medium">{config.type} <span className="text-muted-foreground">{config.subType}</span></h4>
                    <div className="flex items-center gap-4">
                      <div className="w-full space-y-1">
                        <Label htmlFor={`${config.id}-start`}>Start Hour (0-23)</Label>
                        <Input
                          id={`${config.id}-start`}
                          type="number"
                          min="0"
                          max="23"
                          value={settings.timeRanges[config.id]?.start ?? ''}
                          onChange={(e) => handleTimeChange(config.id, 'start', e.target.value)}
                          className="font-code"
                        />
                      </div>
                      <div className="w-full space-y-1">
                        <Label htmlFor={`${config.id}-end`}>End Hour (0-23)</Label>
                        <Input
                          id={`${config.id}-end`}
                          type="number"
                          min="0"
                          max="23"
                          value={settings.timeRanges[config.id]?.end ?? ''}
                          onChange={(e) => handleTimeChange(config.id, 'end', e.target.value)}
                           className="font-code"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
