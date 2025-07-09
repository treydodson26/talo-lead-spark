import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Download, Copy, RefreshCw, QrCode } from "lucide-react";
import { useQRCode } from "@/hooks/useQRCode";
import { useToast } from "@/hooks/use-toast";

interface QRCodeManagementProps {
  onBack: () => void;
}

export function QRCodeManagement({ onBack }: QRCodeManagementProps) {
  const [customUrl, setCustomUrl] = useState(window.location.origin);
  const { qrCodeUrl, isLoading, error } = useQRCode(customUrl);
  const { toast } = useToast();

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(customUrl);
      toast({
        title: "URL Copied!",
        description: "The form URL has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy URL to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = 'talo-yoga-lead-form-qr.png';
    link.href = qrCodeUrl;
    link.click();
    
    toast({
      title: "QR Code Downloaded!",
      description: "The QR code has been saved to your device.",
    });
  };

  const handleResetUrl = () => {
    setCustomUrl(window.location.origin);
    toast({
      title: "URL Reset",
      description: "URL has been reset to the default form link.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-soft p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="soft" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">QR Code Management</h1>
            <p className="text-muted-foreground">Generate and manage QR codes for lead capture</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code Display */}
          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Generated QR Code
              </CardTitle>
              <CardDescription>
                Scan this code to access the lead capture form
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center p-6">
                {isLoading ? (
                  <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : error ? (
                  <div className="w-64 h-64 bg-destructive/10 rounded-lg flex items-center justify-center">
                    <p className="text-destructive text-center">
                      {error}
                    </p>
                  </div>
                ) : qrCodeUrl ? (
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code for Lead Form" 
                    className="w-64 h-64 rounded-lg shadow-soft"
                  />
                ) : (
                  <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">No QR code generated</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleDownloadQR} 
                  disabled={!qrCodeUrl || isLoading}
                  variant="zen"
                  className="flex-1"
                >
                  <Download className="w-4 h-4" />
                  Download QR Code
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* URL Configuration */}
          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardHeader>
              <CardTitle>Form URL Configuration</CardTitle>
              <CardDescription>
                Customize the URL that the QR code will link to
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Form URL</Label>
                <Input
                  id="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://your-domain.com/form"
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCopyUrl} variant="outline" className="flex-1">
                  <Copy className="w-4 h-4" />
                  Copy URL
                </Button>
                <Button onClick={handleResetUrl} variant="outline">
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </Button>
              </div>

              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-primary mb-2">Usage Instructions:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Print the QR code and place it at your studio entrance</li>
                  <li>• Add it to your marketing materials and flyers</li>
                  <li>• Include it in social media posts</li>
                  <li>• Display it at events and workshops</li>
                </ul>
              </div>

              <div className="mt-4 p-4 bg-success/5 rounded-lg border border-success/20">
                <h4 className="font-semibold text-success mb-2">Pro Tip:</h4>
                <p className="text-sm text-muted-foreground">
                  Test the QR code with different devices to ensure it works properly. 
                  The form is optimized for mobile viewing.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-card border-0 shadow-medium mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <QrCode className="w-6 h-6" />
                <span className="font-medium">Print Ready QR</span>
                <span className="text-xs text-muted-foreground">High resolution for printing</span>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <Download className="w-6 h-6" />
                <span className="font-medium">Social Media Kit</span>
                <span className="text-xs text-muted-foreground">Sized for social platforms</span>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <Copy className="w-6 h-6" />
                <span className="font-medium">Share Link</span>
                <span className="text-xs text-muted-foreground">Direct URL for digital sharing</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}