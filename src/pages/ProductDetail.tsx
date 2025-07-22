import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  MessageCircle, 
  MapPin, 
  Star, 
  Package, 
  Shield, 
  Globe,
  Phone,
  Mail
} from "lucide-react";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  description: string;
  price_range: string;
  country_of_origin: string;
  tags: string[];
  min_order_quantity: number;
  specifications: any;
  certification_standards: string[];
  images: any;
  categories: { name: string } | null;
  profiles: {
    id: string;
    company_name: string;
    contact_person: string;
    is_verified: boolean;
    description: string;
    city: string;
    country: string;
    website: string;
    profile_image_url: string;
  };
}

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name),
          profiles(
            id,
            company_name,
            contact_person,
            is_verified,
            description,
            city,
            country,
            website,
            profile_image_url
          )
        `)
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-muted rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Images */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[selectedImage]} 
                        alt={product.name}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No image available</p>
                      </div>
                    )}
                  </div>

                  {/* Image Thumbnails */}
                  {product.images && product.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                            selectedImage === index ? 'border-primary' : 'border-transparent'
                          }`}
                        >
                          <img 
                            src={image} 
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{product.description}</p>
                </div>

                {product.specifications && (
                  <div>
                    <h4 className="font-medium mb-2">Specifications</h4>
                    <div className="bg-muted rounded-lg p-4">
                      <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {JSON.stringify(product.specifications, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {product.certification_standards && product.certification_standards.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Certifications</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.certification_standards.map((cert, index) => (
                        <Badge key={index} variant="outline">
                          <Shield className="w-3 h-3 mr-1" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {product.tags && product.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Product Info & Supplier */}
          <div className="space-y-6">
            {/* Product Info Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2">{product.name}</CardTitle>
                    {product.categories && (
                      <Badge variant="outline">{product.categories.name}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-lg text-primary mb-1">
                    {product.price_range || "Contact for quote"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Min. order: {product.min_order_quantity || 'N/A'} units
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>Origin: {product.country_of_origin}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button asChild className="w-full">
                    <Link to="/inquiry/new" state={{ product }}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Inquiry
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Supplier
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Supplier Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Supplier Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={product.profiles.profile_image_url} />
                    <AvatarFallback>
                      {product.profiles.company_name?.charAt(0) || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium">{product.profiles.company_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {product.profiles.contact_person}
                    </p>
                    {product.profiles.is_verified && (
                      <Badge variant="default" className="mt-1">
                        <Star className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>

                {product.profiles.description && (
                  <p className="text-sm text-muted-foreground">
                    {product.profiles.description}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{product.profiles.city}, {product.profiles.country}</span>
                  </div>
                  {product.profiles.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <a 
                        href={product.profiles.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>

                <Separator />

                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/supplier/${product.profiles.id}`}>
                    View Full Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;