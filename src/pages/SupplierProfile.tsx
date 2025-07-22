import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  MessageCircle, 
  MapPin, 
  Star, 
  Globe,
  Phone,
  Mail,
  Building,
  Calendar,
  Package,
  Award
} from "lucide-react";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import { supabase } from "@/integrations/supabase/client";

interface Supplier {
  id: string;
  company_name: string;
  contact_person: string;
  description: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  website: string;
  profile_image_url: string;
  is_verified: boolean;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price_range: string;
  country_of_origin: string;
  tags: string[];
  categories: { name: string } | null;
}

const SupplierProfile = () => {
  const { id } = useParams();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchSupplier();
      fetchSupplierProducts();
    }
  }, [id]);

  const fetchSupplier = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('user_type', 'supplier')
        .single();

      if (error) throw error;
      setSupplier(data);
    } catch (error) {
      console.error('Error fetching supplier:', error);
    }
  };

  const fetchSupplierProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `)
        .eq('supplier_id', id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="h-48 bg-muted rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Supplier not found</h1>
          <Button asChild>
            <Link to="/products">Browse Products</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/products">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Link>
          </Button>
        </div>

        {/* Supplier Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 flex-1">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={supplier.profile_image_url} />
                  <AvatarFallback className="text-2xl">
                    {supplier.company_name?.charAt(0) || 'S'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-heading font-bold">
                      {supplier.company_name}
                    </h1>
                    {supplier.is_verified && (
                      <Badge variant="default">
                        <Star className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-lg text-muted-foreground mb-3">
                    {supplier.contact_person}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {supplier.city}, {supplier.country}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Member since {new Date(supplier.created_at).getFullYear()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      {products.length} products
                    </div>
                  </div>

                  {supplier.description && (
                    <p className="text-muted-foreground max-w-2xl">
                      {supplier.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full lg:w-auto">
                <Button className="lg:w-48">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                
                {supplier.phone && (
                  <Button variant="outline" className="lg:w-48">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                )}
                
                {supplier.website && (
                  <Button variant="outline" className="lg:w-48" asChild>
                    <a href={supplier.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
            <TabsTrigger value="about">About Company</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-all duration-200">
                  <div className="h-48 bg-muted rounded-t-lg flex items-center justify-center">
                    <Package className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      {product.categories && (
                        <Badge variant="outline" className="mt-1">
                          {product.categories.name}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-1" />
                        {product.country_of_origin}
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        {product.price_range || "Contact for quote"}
                      </div>
                    </div>

                    {product.tags && product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {product.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" asChild>
                        <Link to={`/product/${product.id}`}>
                          View Details
                        </Link>
                      </Button>
                      <Button size="sm" className="flex-1">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Inquire
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No products available</h3>
                <p className="text-muted-foreground">
                  This supplier hasn't listed any products yet.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="about">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">About</h4>
                    <p className="text-muted-foreground">
                      {supplier.description || "No description available."}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Address</h4>
                    <div className="text-muted-foreground">
                      {supplier.address && <p>{supplier.address}</p>}
                      <p>{supplier.city}, {supplier.state}</p>
                      <p>{supplier.country}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{supplier.company_name}</p>
                      <p className="text-sm text-muted-foreground">Company Name</p>
                    </div>
                  </div>

                  {supplier.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{supplier.phone}</p>
                        <p className="text-sm text-muted-foreground">Phone Number</p>
                      </div>
                    </div>
                  )}

                  {supplier.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <a 
                          href={supplier.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline"
                        >
                          {supplier.website}
                        </a>
                        <p className="text-sm text-muted-foreground">Website</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="certifications">
            <Card>
              <CardHeader>
                <CardTitle>Certifications & Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No certifications listed</h3>
                  <p className="text-muted-foreground">
                    Certification information will be displayed here when available.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default SupplierProfile;