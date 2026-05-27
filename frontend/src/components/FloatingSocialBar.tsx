"use client";

import { MessageCircle, Camera, Play, Link as LinkIcon, Send, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function FloatingSocialBar({ settings }: { settings?: any }) {
  const social = settings?.socialLinks || {
    facebook: 'https://facebook.com/youthcamping/',
    instagram: 'https://instagram.com/youthcamping.online/',
    youtube: 'https://youtube.com/channel/UC378U1Xiw7ZWCdj84FFVFtw',
    twitter: 'https://x.com/youthcamping',
    linkedin: 'https://linkedin.com/company/youthcamping-online'
  };

  const phone = settings?.contactPhone || '99242 46267';
  const whatsappNumber = phone.replace(/\D/g, '');

  return (
    <div className="max-w-7xl mx-auto px-6 relative -mb-16 z-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white rounded-[32px] shadow-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20 border border-zinc-50"
      >
        {/* WhatsApp Left */}
        <div className="flex items-center gap-6">
          <a 
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="w-16 h-16 md:w-20 md:h-20 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 hover:scale-110 transition-transform shrink-0"
          >
            <svg className="w-10 h-10 md:w-12 md:h-12 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </a>
          <div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Don&apos;t wait any longer, Contact us!</p>
            <p className="text-3xl md:text-5xl font-black text-navy tracking-tighter">{phone}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-20 bg-zinc-100" />

        {/* Social Right */}
        <div className="flex flex-col items-center md:items-start gap-6">
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Be part of our Social Media Journey!</p>
          <div className="flex gap-4">
            {/* Instagram */}
            {social.instagram && (
              <a 
                href={social.instagram} 
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white rounded-[12px] flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-pink-500/20 group"
              >
                <Camera className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </a>
            )}
            
            {/* YouTube */}
            {social.youtube && (
              <a 
                href={social.youtube} 
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-[#FF0000] text-white rounded-[12px] flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-red-600/20 group"
              >
                <Play className="w-6 h-6 fill-white group-hover:scale-110 transition-transform" />
              </a>
            )}

            {/* Facebook */}
            {social.facebook && (
              <a 
                href={social.facebook} 
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-[#1877F2] text-white rounded-[12px] flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-blue-600/20 group"
              >
                <svg className="w-6 h-6 fill-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
