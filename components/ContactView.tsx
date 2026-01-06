import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { CONTACT_INFO } from '../constants';

const ContactView: React.FC = () => {
  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      <h1 className="text-2xl font-bold text-stone-900">Contactez-nous</h1>
      
      {/* Contact Direct */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 space-y-4">
        <h2 className="font-semibold text-stone-800 mb-2">Service Client</h2>
        
        <a href={`tel:${CONTACT_INFO.phone}`} className="flex items-center gap-4 text-stone-600 hover:text-emerald-700 transition-colors">
          <div className="bg-emerald-50 p-2.5 rounded-full text-emerald-600">
            <Phone size={20} />
          </div>
          <div>
            <span className="text-xs text-stone-400 block font-medium uppercase tracking-wider">Téléphone</span>
            <span className="font-medium text-sm">{CONTACT_INFO.phone}</span>
          </div>
        </a>

        <a href={`mailto:${CONTACT_INFO.email}`} className="flex items-center gap-4 text-stone-600 hover:text-emerald-700 transition-colors">
          <div className="bg-emerald-50 p-2.5 rounded-full text-emerald-600">
            <Mail size={20} />
          </div>
          <div>
            <span className="text-xs text-stone-400 block font-medium uppercase tracking-wider">Email</span>
            <span className="font-medium text-sm break-all">{CONTACT_INFO.email}</span>
          </div>
        </a>
      </div>

      {/* Adresses */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100">
        <h2 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-emerald-600" />
            Nos Adresses
        </h2>
        
        <div className="space-y-5 relative">
            {/* Connector Line */}
            <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-stone-100"></div>

            {CONTACT_INFO.addresses.map((addr, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-stone-200 border-2 border-white shadow-sm flex-shrink-0 z-10"></div>
                    <div>
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide block mb-0.5">{addr.label}</span>
                        <p className="text-sm text-stone-600">{addr.value}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Horaires */}
      <div className="bg-stone-900 text-white p-5 rounded-2xl shadow-md">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Clock size={18} className="text-emerald-400" />
            Horaires d'ouverture
        </h2>
        <div className="space-y-3 text-sm text-stone-300">
            <div className="flex justify-between border-b border-stone-700 pb-2">
                <span>Lundi - Vendredi</span>
                <span className="font-medium text-white">{CONTACT_INFO.hours.week}</span>
            </div>
            <div className="flex justify-between">
                <span>Samedi</span>
                <span className="font-medium text-white">{CONTACT_INFO.hours.saturday}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ContactView;