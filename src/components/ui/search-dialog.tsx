import { useState, useEffect } from "react";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Search, FileText, Clock, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  base_price: number;
  estimated_days: number;
}

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  onServiceSelect: (service: Service) => void;
}

export function SearchDialog({ isOpen, onClose, services, onServiceSelect }: SearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onClose]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  };

  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleServiceSelect = (service: Service) => {
    onServiceSelect(service);
    onClose();
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <Command className="rounded-lg border shadow-md">
        <CommandInput
          placeholder="Buscar serviços..."
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <CommandList>
          <CommandEmpty>
            <div className="flex flex-col items-center gap-2 p-4">
              <Search className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Nenhum serviço encontrado para "{searchTerm}"
              </p>
            </div>
          </CommandEmpty>
          
          {filteredServices.length > 0 && (
            <CommandGroup heading="Serviços Disponíveis">
              {filteredServices.map((service) => (
                <CommandItem
                  key={service.id}
                  onSelect={() => handleServiceSelect(service)}
                  className="flex items-center gap-3 p-3 cursor-pointer"
                >
                  <FileText className="h-4 w-4 text-primary" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{service.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {service.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <DollarSign className="h-3 w-3" />
                        {formatPrice(service.base_price)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {service.estimated_days} dias
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}