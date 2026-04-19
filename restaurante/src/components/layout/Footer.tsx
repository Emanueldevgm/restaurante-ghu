import React from 'react';
import { Instagram, Facebook, Phone, Mail, MapPin } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <Logo size="lg" variant="full" />
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Desde 2010, oferecemos uma experiência gastronômica única, 
              combinando tradição e inovação em cada prato.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Phone className="w-4 h-4 text-accent" />
                (11) 99999-9999
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Mail className="w-4 h-4 text-accent" />
                contato@grandehoteldouige.com.br
              </li>
              <li className="flex items-start gap-2 text-sm text-primary-foreground/70">
                <MapPin className="w-4 h-4 text-accent mt-0.5" />
                Av. Paulista, 1000<br />São Paulo - SP
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Horários</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li className="flex justify-between">
                <span>Seg - Qui</span>
                <span>12h - 22h</span>
              </li>
              <li className="flex justify-between">
                <span>Sex - Sáb</span>
                <span>12h - 00h</span>
              </li>
              <li className="flex justify-between">
                <span>Domingo</span>
                <span>12h - 20h</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Redes Sociais</h4>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="bg-primary-foreground/20 mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/50">
          <p>© 2024 Grande Hotel do Uige. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary-foreground transition-colors">
              Termos de Uso
            </a>
            <a href="#" className="hover:text-primary-foreground transition-colors">
              Privacidade
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
