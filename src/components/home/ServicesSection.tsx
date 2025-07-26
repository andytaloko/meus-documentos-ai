import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, FileText, Filter, Grid, List } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { Skeleton } from "@/components/ui/skeleton";

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  base_price: number;
  estimated_days: number;
}

interface ServicesSectionProps {
  onServiceSelect: (service: Service) => void;
}

const ServicesSection = ({ onServiceSelect }: ServicesSectionProps) => {
  const { isMobile } = useResponsiveLayout();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const categoryColors = {
    "Cartório": "from-blue-500 to-blue-600",
    "Receita Federal": "from-green-500 to-green-600", 
    "Detran": "from-orange-500 to-orange-600",
    "Trabalho": "from-purple-500 to-purple-600",
    "Outros": "from-gray-500 to-gray-600"
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .order('category, name');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  };

  const categories = ["all", ...Array.from(new Set(services.map(s => s.category)))];
  
  const filteredServices = selectedCategory === "all" 
    ? services 
    : services.filter(s => s.category === selectedCategory);

  const ServiceCard = ({ service, index }: { service: Service; index: number }) => (
    <Card 
      className={`group cursor-pointer h-full transition-all duration-500 hover:shadow-premium hover:scale-105 hover:-translate-y-2 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20 ${
        inView ? 'animate-fadeInUp' : 'opacity-0 translate-y-10'
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={() => onServiceSelect(service)}
    >
      {/* Category color accent */}
      <div className={`h-1 w-full bg-gradient-to-r ${categoryColors[service.category as keyof typeof categoryColors] || categoryColors.Outros} rounded-t-lg`} />
      
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300 line-clamp-2">
            {service.name}
          </CardTitle>
          <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300 flex-shrink-0 ml-2" />
        </div>
        <Badge 
          variant="secondary" 
          className={`w-fit bg-gradient-to-r ${categoryColors[service.category as keyof typeof categoryColors] || categoryColors.Outros} text-white border-none`}
        >
          {service.category}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 group-hover:text-foreground/80 transition-colors duration-300">
          {service.description}
        </p>
        
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-primary">
              {formatPrice(service.base_price)}
            </div>
            <div className="text-xs text-muted-foreground">
              a partir de
            </div>
          </div>
          
          <Badge variant="outline" className="flex items-center gap-1 group-hover:border-primary/40 transition-colors duration-300">
            <Clock className="h-3 w-3" />
            {service.estimated_days} dias
          </Badge>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
        
        {/* Quick action on hover */}
        <div className="absolute inset-x-4 bottom-4 transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <Button size="sm" className="w-full bg-primary/90 hover:bg-primary">
            Solicitar Agora
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const ServiceSkeleton = () => (
    <Card className="h-full">
      <div className="h-1 w-full bg-muted rounded-t-lg" />
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-secondary/5 to-background">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className={`text-center mb-16 transition-all duration-700 ${inView ? 'animate-fadeInUp' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Nossos Serviços
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Documentos oficiais com a garantia de qualidade e rapidez que você precisa
          </p>
        </div>

        {/* Filters and view controls */}
        <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 mb-12 transition-all duration-700 ${inView ? 'animate-fadeInUp' : 'opacity-0 translate-y-10'}`} style={{ animationDelay: '0.2s' }}>
          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize transition-all duration-300"
              >
                <Filter className="h-4 w-4 mr-1" />
                {category === "all" ? "Todos" : category}
              </Button>
            ))}
          </div>

          {/* View mode toggle */}
          {!isMobile && (
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Services grid */}
        {loading ? (
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'} gap-6`}>
            {[...Array(6)].map((_, i) => (
              <ServiceSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className={`grid ${
            viewMode === "list" && !isMobile 
              ? 'grid-cols-1 lg:grid-cols-2' 
              : isMobile 
                ? 'grid-cols-1' 
                : 'grid-cols-2 lg:grid-cols-3'
          } gap-6`}>
            {filteredServices.map((service, index) => (
              <ServiceCard 
                key={service.id} 
                service={service} 
                index={index}
              />
            ))}
          </div>
        )}

        {/* No services message */}
        {!loading && filteredServices.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum serviço encontrado</h3>
            <p className="text-muted-foreground">
              Tente selecionar uma categoria diferente ou volte mais tarde.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;