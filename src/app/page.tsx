'use client';

import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { UploadCloud, CheckCircle2, XCircle, CircleSlash, Loader2 } from 'lucide-react';
import { folderConfig } from '@/lib/folder-config';
import type { FolderStatus, Status } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { useSettings } from '@/context/settings-context';

const StatusDisplay = ({ status, message }: { status: Status; message: string }) => {
  const icon = useMemo(() => {
    switch (status) {
      case 'passing':
        return <CheckCircle2 className="text-success" />;
      case 'failing':
        return <XCircle className="text-destructive" />;
      case 'pending':
        return <CircleSlash className="text-muted-foreground" />;
      default:
        return null;
    }
  }, [status]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-default">
            {icon}
            <span
              className={cn(
                'text-sm',
                status === 'passing' && 'text-success',
                status === 'failing' && 'text-destructive',
                status === 'pending' && 'text-muted-foreground'
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default function FolderFileFinderPage() {
  const [statuses, setStatuses] = useState<FolderStatus[]>(() =>
    folderConfig.map(fc => ({ id: fc.id, status: 'pending', message: 'Awaiting folder upload.', foundFileDetails: {} }))
  );
  const [hasUploaded, setHasUploaded] = useState(false);
  const [allFiles, setAllFiles] = useState<File[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [datesByYear, setDatesByYear] = useState<Record<string, string[]>>({});
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { settings } = useSettings();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }
    
    const firstPath = files[0].webkitRelativePath;
    const pathPartsCheck = firstPath.split('/');
    if (!/^\d{4} TRANSFER$/.test(pathPartsCheck[0])) {
         toast({
            variant: "destructive",
            title: "Incorrect Folder Structure",
            description: "Please upload the '01_TRANSFERS' folder, which should contain year folders like '2024 TRANSFER'.",
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
    }

    setStatuses(folderConfig.map(fc => ({ id: fc.id, status: 'pending', message: 'Awaiting selection.', foundFileDetails: {} })));
    setSelectedYear('');
    setSelectedDate('');
    setDatesByYear({});
    
    setAllFiles(Array.from(files));
    setHasUploaded(true);

    const yearAndDateMap: Record<string, Set<string>> = {};

    for (const file of files) {
      const pathParts = file.webkitRelativePath.split('/');
      if (pathParts.length > 1) {
        const yearDir = pathParts[0];
        const dateDir = pathParts[1];
        if (yearDir && dateDir) {
            if (!yearAndDateMap[yearDir]) {
              yearAndDateMap[yearDir] = new Set();
            }
            yearAndDateMap[yearDir].add(dateDir);
        }
      }
    }
    
    const extractedYears = Object.keys(yearAndDateMap).sort();
    setYears(extractedYears);
    
    const newDatesByYear: Record<string, string[]> = {};
    for (const year in yearAndDateMap) {
      newDatesByYear[year] = Array.from(yearAndDateMap[year]).sort();
    }
    setDatesByYear(newDatesByYear);

    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setSelectedDate('');
  };

  const validateFolders = useCallback((files: File[], year: string, date: string) => {
    console.log(`--- Starting Validation for ${year}/${date} ---`);
    const newStatuses = folderConfig.map(config => {
      console.log(`\nChecking Category: ${config.type} ${config.subType || ''}`);
      if (!config.rules || config.rules.length === 0) {
        console.log(`   - No rules defined. Skipping.`);
        return {
          id: config.id,
          status: 'pending' as Status,
          message: 'Manual check required; no validation path defined.',
          foundFileDetails: {},
        };
      }
      
      const basePath = `${year}/${date}`;
      const requiredFileTypes = new Set(config.requiredFiles);
      const foundFileTypes = new Set<string>();
      const foundFileDetails: Record<string, string[]> = {};
      const timeRangeForConfig = settings.timeCheckEnabled ? settings.timeRanges[config.id] : undefined;

      for (const file of files) {
        if (!file.webkitRelativePath.startsWith(basePath)) continue;

        const fileDir = file.webkitRelativePath.substring(0, file.webkitRelativePath.lastIndexOf('/'));
        const extension = file.name.split('.').pop()?.toLowerCase();

        if (!extension || !config.requiredFiles.includes(extension)) continue;

        for (const rule of config.rules) {
          const fullPatternForRegex = `${basePath}/${rule.pathPattern}`;
          const patternRegex = new RegExp('^' + fullPatternForRegex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/'/g, "'").replace(/\\'/g, "'").replace(/\\\*/g, '.*') + '$');
          
          console.log(` [DEBUG] File: ${file.webkitRelativePath}`);
          console.log(`   - Rule Path: "${rule.pathPattern}"`);
          console.log(`   - Regex: ${patternRegex}`);
          console.log(`   - Testing against Dir: "${fileDir}"`);
          
          if (!patternRegex.test(fileDir)) {
            console.log(`   - Path Match: false`);
            continue;
          }
          console.log(`   - Path Match: true`);

          if (rule.fileNameKeywords) {
            const nameLower = file.name.toLowerCase();
            const hasKeyword = rule.fileNameKeywords.some(keyword => nameLower.includes(keyword.toLowerCase()));
             console.log(`   - Keyword Check: Filename is "${nameLower}". Required: ${rule.fileNameKeywords.join(', ')}. Match: ${hasKeyword}`);
            if (!hasKeyword) continue;
          }

          if (settings.timeCheckEnabled && timeRangeForConfig) {
            const fileDate = new Date(file.lastModified);
            const fileHour = fileDate.getHours();
            const timeMatch = fileHour >= timeRangeForConfig.start && fileHour <= timeRangeForConfig.end;
            console.log(`   - Time Check: File time is ${fileDate.toLocaleTimeString()}. Hour: ${fileHour}. Required: ${timeRangeForConfig.start}-${timeRangeForConfig.end}. Match: ${timeMatch}`);
            if (!timeMatch) continue;
          }
          
          console.log(`   - SUCCESS: Rule matched for file ${file.name}`);
          foundFileTypes.add(extension);

          if (rule.category) {
            if (!foundFileDetails[extension]) foundFileDetails[extension] = [];
            if (!foundFileDetails[extension].includes(rule.category)) {
              foundFileDetails[extension].push(rule.category);
            }
          }
        }
      }
      
      const allFound = [...requiredFileTypes].every(ext => foundFileTypes.has(ext));
      let finalStatus: Status;
      let finalMessage: string;

      if (allFound) {
        finalStatus = 'passing';
        finalMessage = 'All required file types found.';
      } else {
        const missing = [...requiredFileTypes].filter(ext => !foundFileTypes.has(ext));
        finalStatus = 'failing';
        finalMessage = `Missing types: ${missing.join(', ')}`;
      }
      console.log(` --> Status for ${config.type}: ${finalStatus.toUpperCase()} ${finalStatus === 'failing' ? `(${finalMessage})` : ''}`);
      return { 
          id: config.id, 
          status: finalStatus, 
          message: finalMessage,
          foundFileDetails,
      };
    });
    console.log(`\n--- Validation Complete ---`);
    setStatuses(newStatuses);
  }, [settings]);
  
  const handleScan = () => {
    if (!selectedYear || !selectedDate) return;
    setIsScanning(true);
    // Use a timeout to allow UI to update to "Scanning..."
    setTimeout(() => {
        validateFolders(allFiles, selectedYear, selectedDate);
        setIsScanning(false);
    }, 50);
  };

  const tableData = useMemo(() => {
    return folderConfig.map(config => {
      const statusInfo = statuses.find(s => s.id === config.id);
      return {
        ...config,
        status: statusInfo?.status ?? 'pending',
        message: statusInfo?.message ?? 'Awaiting scan.',
        foundFileDetails: statusInfo?.foundFileDetails ?? {},
      };
    });
  }, [statuses]);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <main className="max-w-7xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="font-headline text-3xl">File Validator</CardTitle>
                  <CardDescription className="mt-2 text-base">
                    Upload your '01_TRANSFERS' folder, then select a year and date to scan.
                  </CardDescription>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  webkitdirectory=""
                  directory=""
                />
                <Button onClick={handleUploadClick} size="lg">
                  <UploadCloud className="mr-2 h-5 w-5" />
                  {hasUploaded ? 'Change Folder' : 'Upload Folder'}
                </Button>
            </div>
            {hasUploaded && (
              <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-lg bg-muted/50">
                <Select onValueChange={handleYearChange} value={selectedYear} disabled={years.length === 0}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select onValueChange={setSelectedDate} value={selectedDate} disabled={!selectedYear}>
                  <SelectTrigger className="w-full sm:w-[280px]">
                    <SelectValue placeholder="Select Date" />
                  </SelectTrigger>
                  <SelectContent>
                    {(datesByYear[selectedYear] || []).map(date => (
                      <SelectItem key={date} value={date}>{date}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleScan} disabled={!selectedDate || isScanning} className="w-full sm:w-auto">
                  {isScanning ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Scanning...
                    </>
                  ) : 'Scan'}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Folder Type</TableHead>
                    <TableHead>Path</TableHead>
                    <TableHead>Required File Types</TableHead>
                    <TableHead className="w-[150px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5 text-primary" />
                          <div>
                            <div>{item.type}</div>
                            {item.subType && <div className="text-xs text-muted-foreground">{item.subType}</div>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="font-code text-sm bg-muted px-2 py-1 rounded-md">{item.displayPath}</code>
                      </TableCell>
                       <TableCell>
                        {item.subType === '(Pics)' && item.id !== 'missionary-requests-pics' ? (
                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1" className="border-b-0">
                              <AccordionTrigger className="py-1 hover:no-underline">
                                <div className="flex flex-wrap gap-2">
                                  {item.requiredFiles.map(ext => (
                                    <Badge key={ext} variant="secondary" className="font-code">
                                      .{ext}
                                    </Badge>
                                  ))}
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="p-2 mt-2 bg-muted/50 rounded-md space-y-1">
                                  {['EDITED', 'JPEG', 'RAW'].map(cat => {
                                    const isFound = item.requiredFiles.some(ext =>
                                      item.foundFileDetails?.[ext]?.includes(cat)
                                    );
                                    return (
                                      <div key={cat} className="flex items-center justify-between text-sm px-2">
                                        <span>{cat.charAt(0) + cat.slice(1).toLowerCase()}</span>
                                        {isFound ? (
                                          <CheckCircle2 className="h-4 w-4 text-success" />
                                        ) : (
                                          <XCircle className="h-4 w-4 text-destructive" />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {item.requiredFiles.map(ext => (
                              <Badge key={ext} variant="secondary" className="font-code">
                                .{ext}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusDisplay status={item.status} message={item.message} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
