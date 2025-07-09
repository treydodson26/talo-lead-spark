import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Search, User, Mail, Phone, MapPin, Calendar, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  customer_type: string;
  customer_status: string;
  customer_since: string;
  marketing_consent: boolean;
  city: string | null;
  state: string | null;
  company_name: string | null;
  total_spent: number;
  last_purchase_date: string | null;
  notes: string | null;
  tags: string[];
}

interface CustomerDashboardProps {
  onBack: () => void;
}

export function CustomerDashboard({ onBack }: CustomerDashboardProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchTerm, customers]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('emily_customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (err: any) {
      toast({
        title: "Error Loading Customers",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter(customer =>
      customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchTerm)) ||
      (customer.company_name && customer.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredCustomers(filtered);
  };

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'business':
        return 'bg-blue-100 text-blue-800';
      case 'individual':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-zen p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
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
              <h1 className="text-3xl font-bold text-foreground">Customer Database</h1>
              <p className="text-muted-foreground">Manage your yoga studio customers</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search customers by name, email, phone, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                  <p className="text-2xl font-bold">{customers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Business</p>
                  <p className="text-2xl font-bold">
                    {customers.filter(c => c.customer_type === 'business').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Individual</p>
                  <p className="text-2xl font-bold">
                    {customers.filter(c => c.customer_type === 'individual').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Marketing Opt-in</p>
                  <p className="text-2xl font-bold">
                    {customers.filter(c => c.marketing_consent).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Gallery */}
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
            <CardDescription>
              {searchTerm ? `Search results for "${searchTerm}"` : "All customers in your database"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{searchTerm ? "No customers found matching your search" : "No customers in database"}</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredCustomers.map((customer) => (
                  <Card key={customer.id} className="bg-background border-border hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-4">
                        {/* Profile Picture */}
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.first_name} ${customer.last_name}`} />
                          <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                            {getInitials(customer.first_name, customer.last_name)}
                          </AvatarFallback>
                        </Avatar>

                        {/* Customer Info */}
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">
                            {customer.first_name} {customer.last_name}
                          </h3>
                          
                          {customer.company_name && (
                            <p className="text-sm text-muted-foreground font-medium">{customer.company_name}</p>
                          )}

                          <div className="flex gap-2 justify-center">
                            <Badge className={getCustomerTypeColor(customer.customer_type)} variant="secondary">
                              {customer.customer_type}
                            </Badge>
                            <Badge className={getStatusColor(customer.customer_status)} variant="secondary">
                              {customer.customer_status}
                            </Badge>
                          </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-2 w-full">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{customer.email}</span>
                          </div>
                          
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                          
                          {(customer.city || customer.state) && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{customer.city}{customer.city && customer.state && ', '}{customer.state}</span>
                            </div>
                          )}
                        </div>

                        {/* Additional Info */}
                        <div className="space-y-1 w-full text-sm text-muted-foreground">
                          <div className="flex items-center justify-between">
                            <span>Customer since:</span>
                            <span>{formatDate(customer.customer_since)}</span>
                          </div>
                          
                          {customer.total_spent > 0 && (
                            <div className="flex items-center justify-between">
                              <span>Total spent:</span>
                              <span className="font-semibold text-foreground">{formatCurrency(customer.total_spent)}</span>
                            </div>
                          )}
                          
                          {customer.marketing_consent && (
                            <div className="flex items-center justify-center pt-2">
                              <Badge variant="outline" className="text-xs">✓ Marketing Opt-in</Badge>
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        {customer.tags && customer.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap justify-center">
                            {customer.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {customer.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{customer.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Notes */}
                        {customer.notes && (
                          <div className="w-full pt-2 border-t border-border">
                            <p className="text-xs text-muted-foreground line-clamp-2">{customer.notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}