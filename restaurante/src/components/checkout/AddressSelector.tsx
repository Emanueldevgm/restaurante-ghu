import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

export interface Address {
  id: string;
  rua: string;
  numero?: string;
  bairro: string;
  municipio: string;
  provincia: string;
}

interface AddressSelectorProps {
  addresses: Address[];
  selectedId: string;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

export function AddressSelector({ addresses, selectedId, onSelect, isLoading = false }: AddressSelectorProps) {
  const navigate = useNavigate();

  if (addresses.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Endereço de entrega</Label>
        <div className="bg-muted/30 rounded-lg p-4 text-center space-y-3">
          <MapPin className="w-8 h-8 mx-auto text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">
            Você ainda não possui endereços cadastrados.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/cliente/enderecos')}
            className="w-full"
          >
            Cadastrar endereço
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Endereço de entrega</Label>
      <Select value={selectedId} onValueChange={onSelect} disabled={isLoading}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione um endereço" />
        </SelectTrigger>
        <SelectContent>
          {addresses.map((addr) => (
            <SelectItem key={addr.id} value={addr.id}>
              <div className="flex flex-col items-start">
                <span className="font-medium">
                  {addr.rua}{addr.numero ? `, ${addr.numero}` : ''}
                </span>
                <span className="text-xs text-muted-foreground">
                  {addr.bairro} - {addr.municipio}, {addr.provincia}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="link"
        size="sm"
        className="px-0 h-auto text-xs"
        onClick={() => navigate('/cliente/enderecos')}
      >
        Gerenciar endereços
      </Button>
    </div>
  );
}