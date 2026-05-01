import React from 'react';
import { Instagram, Facebook, Phone, Mail, MapPin } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="mt-10 px-4 pb-6">
      <div className="container section-shell overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 px-6 py-14 text-white sm:px-10">
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4">
              <Logo size="lg" variant="full" className="text-white" />
            </div>
            <p className="text-sm leading-relaxed text-blue-100/80">
              Desde 2010, entregamos uma experiencia gastronomica marcante,
              com servico fluido, reservas simples e um ambiente digital moderno.
            </p>
          </div>

          <div>
            <h4 className="font-display mb-4 text-lg font-semibold">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-blue-100/80">
                <Phone className="h-4 w-4 text-cyan-300" />
                (11) 99999-9999
              </li>
              <li className="flex items-center gap-2 text-sm text-blue-100/80">
                <Mail className="h-4 w-4 text-cyan-300" />
                contato@grandehoteldouige.com.br
              </li>
              <li className="flex items-start gap-2 text-sm text-blue-100/80">
                <MapPin className="mt-0.5 h-4 w-4 text-cyan-300" />
                Av. Paulista, 1000
                <br />
                Sao Paulo - SP
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display mb-4 text-lg font-semibold">Horarios</h4>
            <ul className="space-y-2 text-sm text-blue-100/80">
              <li className="flex justify-between">
                <span>Seg - Qui</span>
                <span>12h - 22h</span>
              </li>
              <li className="flex justify-between">
                <span>Sex - Sab</span>
                <span>12h - 00h</span>
              </li>
              <li className="flex justify-between">
                <span>Domingo</span>
                <span>12h - 20h</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display mb-4 text-lg font-semibold">Redes Sociais</h4>
            <div className="flex gap-3">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 transition-colors hover:bg-white hover:text-primary"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 transition-colors hover:bg-white hover:text-primary"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="mb-8 bg-white/15" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-blue-100/60 md:flex-row">
          <p>© 2024 Grande Hotel do Uige. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-white">
              Termos de Uso
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Privacidade
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
