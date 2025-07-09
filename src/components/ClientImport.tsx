import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Papa from 'papaparse';

interface CSVRow {
  'Client Name': string;
  'First Name': string;
  'Last Name': string;
  'Client Email': string;
  'Phone Number': string;
  'Birthday': string;
  'Address': string;
  'Marketing Email Opt-in': string;
  'Marketing Text Opt In': string;
  'Agree to Liability Waiver': boolean | string;
  'Pre-Arketa Milestone Count': string;
  'Transactional Text Opt In': string;
  'First Seen': string;
  'Last Seen': string;
  'Tags': string;
}

interface ClientImportProps {
  onBack: () => void;
}

export const ClientImport = ({ onBack }: ClientImportProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    errors: number;
    total: number;
  } | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setImportResult(null);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
    }
  };

  const parseDate = (dateString: string): string | null => {
    if (!dateString || dateString.trim() === '') return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return date.toISOString().split('T')[0];
    } catch {
      return null;
    }
  };

  const parseBoolean = (value: string | boolean): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value.toLowerCase() === 'yes' || value === '1';
    }
    return false;
  };

  const transformCSVData = (csvData: CSVRow[]) => {
    return csvData.map((row) => {
      try {
        return {
          first_name: row['First Name']?.trim() || '',
          last_name: row['Last Name']?.trim() || '',
          email: row['Client Email']?.trim() || '',
          phone: row['Phone Number']?.toString().trim() || null,
          date_of_birth: parseDate(row['Birthday']),
          address_line_1: row['Address']?.trim() || null,
          marketing_consent: parseBoolean(row['Marketing Email Opt-in']),
          marketing_text_opt_in: parseBoolean(row['Marketing Text Opt In']),
          agree_to_liability_waiver: parseBoolean(row['Agree to Liability Waiver']),
          pre_arketa_milestone_count: row['Pre-Arketa Milestone Count'] ? 
            parseInt(row['Pre-Arketa Milestone Count']) || null : null,
          transactional_text_opt_in: parseBoolean(row['Transactional Text Opt In']),
          first_seen: parseDate(row['First Seen']),
          last_seen: parseDate(row['Last Seen']),
          tags: row['Tags'] ? row['Tags'].split(',').map(tag => tag.trim()).filter(Boolean) : [],
          company_name: row['Client Name']?.trim() || null,
          customer_since: parseDate(row['First Seen']) || new Date().toISOString().split('T')[0],
          customer_type: 'individual',
          customer_status: 'active',
          country: 'US',
          preferred_contact_method: 'email',
          total_spent: 0,
          credit_limit: 0
        };
      } catch (error) {
        console.error('Error transforming row:', error);
        return null;
      }
    }).filter(Boolean);
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to import.",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);

    try {
      const fileText = await file.text();
      
      Papa.parse(fileText, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const csvData = results.data as CSVRow[];
          const transformedData = transformCSVData(csvData);
          
          if (transformedData.length === 0) {
            toast({
              title: "No Valid Data",
              description: "No valid records found in the CSV file.",
              variant: "destructive",
            });
            setImporting(false);
            return;
          }

          // Insert data in batches
          const batchSize = 50;
          let successCount = 0;
          let errorCount = 0;

          for (let i = 0; i < transformedData.length; i += batchSize) {
            const batch = transformedData.slice(i, i + batchSize);
            
            const { error } = await supabase
              .from('emily_customers')
              .upsert(batch, { 
                onConflict: 'email',
                ignoreDuplicates: false 
              });

            if (error) {
              console.error('Batch insert error:', error);
              errorCount += batch.length;
            } else {
              successCount += batch.length;
            }
          }

          setImportResult({
            success: successCount,
            errors: errorCount,
            total: transformedData.length
          });

          toast({
            title: "Import Completed",
            description: `Successfully imported ${successCount} customers${errorCount > 0 ? ` (${errorCount} errors)` : ''}.`,
          });
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
          toast({
            title: "CSV Parse Error",
            description: "Failed to parse the CSV file.",
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Error",
        description: "An unexpected error occurred during import.",
        variant: "destructive",
      });
    }

    setImporting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-zen p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Import Customers</h1>
            <p className="text-muted-foreground">Upload CSV file to import customer data</p>
          </div>
        </div>

        {/* Import Form */}
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              CSV File Upload
            </CardTitle>
            <CardDescription>
              Select a CSV file with customer data to import into your database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
            
            {file && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Selected file:</p>
                <p className="text-sm text-muted-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Size: {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            )}

            <Button 
              onClick={handleImport} 
              disabled={!file || importing}
              className="w-full"
              variant="zen"
            >
              {importing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Customers
                </>
              )}
            </Button>

            {/* Expected CSV Format */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Expected CSV Format:</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Client Name, First Name, Last Name, Client Email</p>
                <p>• Phone Number, Birthday, Address</p>
                <p>• Marketing Email Opt-in, Marketing Text Opt In</p>
                <p>• Agree to Liability Waiver, Pre-Arketa Milestone Count</p>
                <p>• Transactional Text Opt In, First Seen, Last Seen, Tags</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Import Results */}
        {importResult && (
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold text-lg">Import Complete!</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-primary">{importResult.total}</p>
                    <p className="text-sm text-muted-foreground">Total Records</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{importResult.success}</p>
                    <p className="text-sm text-muted-foreground">Successful</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{importResult.errors}</p>
                    <p className="text-sm text-muted-foreground">Errors</p>
                  </div>
                </div>
                
                {importResult.success > 0 && (
                  <div className="text-center pt-4">
                    <Button onClick={onBack} variant="zen">
                      View Imported Customers
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};