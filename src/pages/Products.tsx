import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MapPin, Star, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import { useRef } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price_range: string;
  country_of_origin: string;
  tags: string[];
  categories: { name: string } | null;
  profiles: {
    company_name: string;
    is_verified: boolean;
  };
}

const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [supplierRating, setSupplierRating] = useState('');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState(100000);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = [
        `query=${encodeURIComponent(searchQuery)}`,
        selectedCategory !== "all" ? `category=${encodeURIComponent(selectedCategory)}` : "",
        supplierRating ? `supplierRating=${encodeURIComponent(supplierRating)}` : "",
        location ? `location=${encodeURIComponent(location)}` : "",
        sortBy ? `sortBy=${encodeURIComponent(sortBy)}` : "",
        priceRange !== 100000 ? `maxPrice=${priceRange}` : "",
      ].filter(Boolean).join('&');
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories || []);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Replace filteredProducts logic to use the already filtered products from backend
  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.profiles.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "all" || 
      product.categories?.name === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
            Browse Products
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Discover quality machinery and equipment from verified Chinese suppliers
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-lg border border-card-border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search products, suppliers, or specifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="lg:w-64">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="bg-card rounded-lg border border-card-border p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">Advanced Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Supplier Rating</label>
              <select value={supplierRating} onChange={e => setSupplierRating(e.target.value)} className="p-2 border rounded">
                <option value="">Any</option>
                <option value="4">4+ stars</option>
                <option value="3">3+ stars</option>
                <option value="2">2+ stars</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Location</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="p-2 border rounded" placeholder="e.g. Delhi" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Sort By</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="p-2 border rounded">
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
            <Button onClick={fetchProducts} className="md:col-span-1">Apply Filters</Button>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-muted-foreground">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {/* Products Grid */}
        <div className="sticky top-0 z-10 bg-background mb-6 flex flex-wrap gap-4 items-end p-4 rounded-lg border shadow-sm">
    {/* Category Chips */}
    <div className="flex gap-2 flex-wrap">
      {["all", ...categories.map((c) => c.name)].map((cat) => (
        <button
          key={cat}
          className={`px-3 py-1 rounded-full border ${selectedCategory === cat ? "bg-primary text-white" : "bg-muted"}`}
          onClick={() => setSelectedCategory(cat)}
        >
          {cat.charAt(0).toUpperCase() + cat.slice(1)}
        </button>
      ))}
    </div>
    {/* Price Range Slider */}
    <div>
      <label className="block text-xs font-medium mb-1">Price Range</label>
      <input
        type="range"
        min={0}
        max={100000}
        value={priceRange}
        onChange={e => setPriceRange(Number(e.target.value))}
        className="w-32"
      />
      <span className="ml-2 text-xs">Up to ₹{priceRange}</span>
    </div>
    {/* Supplier Rating as Stars */}
    <div>
      <label className="block text-xs font-medium mb-1">Supplier Rating</label>
      <div className="flex gap-1">
        {[5, 4, 3, 2].map((r) => (
          <button
            key={r}
            className={`text-xl ${supplierRating === String(r) ? "text-yellow-400" : "text-gray-300"}`}
            onClick={() => setSupplierRating(String(r))}
          >
            <Star />
          </button>
        ))}
        <button onClick={() => setSupplierRating("")} className="ml-2 text-xs underline">Any</button>
      </div>
    </div>
    {/* Location Input */}
    <div>
      <label className="block text-xs font-medium mb-1">Location</label>
      <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="p-2 border rounded" placeholder="e.g. Delhi" />
    </div>
    {/* Sort By */}
    <div>
      <label className="block text-xs font-medium mb-1">Sort By</label>
      <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="p-2 border rounded">
        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
    {/* Apply & Clear Buttons */}
    <Button onClick={fetchProducts}>Apply Filters</Button>
    <Button variant="outline" onClick={() => {
      setSelectedCategory('all');
      setSupplierRating('');
      setLocation('');
      setSortBy('newest');
      setPriceRange(100000);
      fetchProducts();
    }}>Clear All</Button>
  </div>
  {/* Show Active Filters as Tags */}
  <div className="mb-4 flex gap-2 flex-wrap">
    {selectedCategory !== 'all' && <Badge>{selectedCategory}</Badge>}
    {supplierRating && <Badge>{supplierRating}+ stars</Badge>}
    {location && <Badge>{location}</Badge>}
    {priceRange !== 100000 && <Badge>Up to ₹{priceRange}</Badge>}
  </div>
  {/* Loading Skeletons */}
  {loading ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse bg-muted h-64 rounded-lg" />
      ))}
    </div>
  ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-200">
                <div className="h-48 bg-muted rounded-t-lg flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Product Image</span>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    {product.profiles.is_verified && (
                      <Badge variant="secondary" className="ml-2">
                        <Star className="w-3 h-3 mr-1" />
                        Verified
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
                      Price: {product.price_range || "Contact for quote"}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {product.tags?.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      by {product.profiles.company_name}
                    </span>
                    <Button size="sm" variant="accent" asChild>
                      <Link to={`/product/${product.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or browse all categories
            </p>
            <Button onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Products;