import { useState } from "react";
// SEO will be handled through document.title and meta tags for now
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Search, User, ArrowRight } from "lucide-react";

// Mock blog posts data
const blogPosts = [
  {
    id: 1,
    title: "Top 10 Manufacturing Trends to Watch in 2024",
    excerpt: "Discover the latest manufacturing trends that are reshaping the industry, from AI automation to sustainable practices.",
    author: "Sarah Johnson",
    date: "2024-01-15",
    readTime: "5 min read",
    category: "Industry Trends",
    image: "/placeholder.svg",
    slug: "manufacturing-trends-2024"
  },
  {
    id: 2,
    title: "How to Choose the Right Chinese Supplier for Your Business",
    excerpt: "A comprehensive guide to supplier selection, due diligence, and building lasting partnerships with Chinese manufacturers.",
    author: "Michael Chen",
    date: "2024-01-12",
    readTime: "8 min read",
    category: "Supplier Guide",
    image: "/placeholder.svg",
    slug: "choose-chinese-supplier"
  },
  {
    id: 3,
    title: "Quality Control Best Practices for Overseas Manufacturing",
    excerpt: "Learn essential quality control strategies to ensure your products meet standards when working with overseas suppliers.",
    author: "Elena Rodriguez",
    date: "2024-01-10",
    readTime: "6 min read",
    category: "Quality Control",
    image: "/placeholder.svg",
    slug: "quality-control-best-practices"
  },
  {
    id: 4,
    title: "Understanding Import Regulations and Compliance",
    excerpt: "Navigate the complex world of import regulations, customs procedures, and compliance requirements for global trade.",
    author: "David Kim",
    date: "2024-01-08",
    readTime: "7 min read",
    category: "Compliance",
    image: "/placeholder.svg",
    slug: "import-regulations-compliance"
  },
  {
    id: 5,
    title: "Building Long-term Supplier Relationships",
    excerpt: "Strategies for developing trust, communication, and mutual success with your manufacturing partners.",
    author: "Lisa Wang",
    date: "2024-01-05",
    readTime: "4 min read",
    category: "Relationships",
    image: "/placeholder.svg",
    slug: "building-supplier-relationships"
  },
  {
    id: 6,
    title: "The Future of Supply Chain Technology",
    excerpt: "Explore how blockchain, IoT, and AI are revolutionizing supply chain management and transparency.",
    author: "Robert Thompson",
    date: "2024-01-03",
    readTime: "6 min read",
    category: "Technology",
    image: "/placeholder.svg",
    slug: "supply-chain-technology-future"
  }
];

const categories = ["All", "Industry Trends", "Supplier Guide", "Quality Control", "Compliance", "Relationships", "Technology"];

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Set document title for SEO
  document.title = "Blog - SeekFactory | Manufacturing Industry Insights & Supplier Guides";

  return (
    <>
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
              Manufacturing Insights & <span className="text-primary">Expert Guides</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Stay ahead with the latest industry trends, supplier selection guides, and manufacturing best practices from our experts.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="transition-all"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
                <div className="aspect-video bg-gradient-subtle rounded-t-lg mb-4 overflow-hidden">
                  <div className="w-full h-full bg-hero-gradient opacity-20 flex items-center justify-center">
                    <span className="text-white/80 text-sm font-medium">{post.category}</span>
                  </div>
                </div>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {post.category}
                    </Badge>
                    <div className="flex items-center text-muted-foreground text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {post.readTime}
                    </div>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <User className="w-3 h-3 mr-1" />
                      <span className="mr-3">{post.author}</span>
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="group-hover:text-primary p-0 h-auto">
                      Read More
                      <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-foreground mb-2">No articles found</h3>
              <p className="text-muted-foreground">Try adjusting your search terms or filter categories.</p>
            </div>
          )}

          {/* Newsletter CTA */}
          <div className="mt-20 text-center bg-gradient-subtle rounded-2xl p-12">
            <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
              Stay Updated with Industry Insights
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get the latest manufacturing trends, supplier tips, and industry news delivered directly to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input placeholder="Enter your email" className="flex-1" />
              <Button className="bg-hero-gradient hover:opacity-90">
                Subscribe
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Blog;