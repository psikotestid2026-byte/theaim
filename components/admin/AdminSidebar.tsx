"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Tags,
  Package,
  Ticket,
  Users,
  Link as LinkIcon,
  ClipboardList,
  CreditCard,
  Landmark,
  BookOpen,
  ReceiptText,
  Mails,
  Mail,
  Brain,
  FileQuestion,
  LineChart,
  Scale,
  Building2,
  Handshake,
  Inbox,
  Briefcase,
  FileText,
  Newspaper,
  Star,
  MonitorPlay,
  GraduationCap,
  Shield,
  Menu,
  X,
  LogOut
} from "lucide-react";

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on mobile when navigating
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navItem = (href: string, label: string, Icon: any) => {
    const isActive = pathname === href || (href !== "/panel" && pathname.startsWith(href));
    return (
      <Link 
        href={href} 
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          isActive 
            ? "bg-red-600 text-white shadow-sm" 
            : "text-slate-400 hover:text-white hover:bg-slate-800"
        }`}
      >
        <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
        {label}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Header Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-black text-white">A</div>
          <span className="font-bold text-lg tracking-tight text-slate-900">TheAIM</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 bg-slate-100 rounded-lg text-slate-600">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 bottom-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between lg:justify-start">
          <Link href="/panel" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-black text-white">A</div>
            <span className="font-bold text-lg tracking-tight">TheAIM Panel</span>
          </Link>
          <button className="lg:hidden p-1 text-slate-400 hover:text-white" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {navItem("/panel", "Dashboard", LayoutDashboard)}

          <div className="mt-6 mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3">Catalog & Pricing</p>
          </div>
          {navItem("/panel/service-categories", "Service Categories", Tags)}
          {navItem("/panel/services", "Services", Package)}
          {navItem("/panel/service-packages", "Service Packages", Ticket)}
          {navItem("/panel/consultants", "Consultants", Users)}
          {navItem("/panel/service-consultants", "Service ↔ Consultant Map", LinkIcon)}

          <div className="mt-6 mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3">Customers & Booking</p>
          </div>
          {navItem("/panel/customers", "Customers", Users)}
          {navItem("/panel/registrations", "Registrations", ClipboardList)}
          {navItem("/panel/payments", "Payments", CreditCard)}

          <div className="mt-6 mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3">Payment Infrastructure</p>
          </div>
          {navItem("/panel/payment-methods", "Payment Methods", Landmark)}
          {navItem("/panel/payment-instructions", "Payment Instructions", BookOpen)}
          {navItem("/panel/payment-logs", "Payment Logs", ReceiptText)}
          {navItem("/panel/notification-templates", "Notification Templates", Mails)}
          {navItem("/panel/notification-logs", "Notification Logs", Mail)}

          <div className="mt-6 mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3">Test Management</p>
          </div>
          {navItem("/panel/test-sessions", "Test Sessions", Brain)}
          {navItem("/panel/test-items", "Question Bank", FileQuestion)}
          {navItem("/panel/test-results", "Test Results", LineChart)}
          {navItem("/panel/scoring-rubrics", "Scoring Rubrics", Scale)}

          <div className="mt-6 mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3">Corporate & Partnership</p>
          </div>
          {navItem("/panel/corporate-inquiries", "Corporate Inquiries", Building2)}
          {navItem("/panel/partnership-submissions", "Partnership Submissions", Handshake)}
          {navItem("/panel/proposal-leads", "Proposal Leads", Inbox)}

          <div className="mt-6 mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3">Recruitment</p>
          </div>
          {navItem("/panel/job-postings", "Job Postings", Briefcase)}
          {navItem("/panel/job-applications", "Job Applications", FileText)}

          <div className="mt-6 mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3">Content & Marketing</p>
          </div>
          {navItem("/panel/articles", "Articles", Newspaper)}
          {navItem("/panel/testimonials", "Testimonials", Star)}
          {navItem("/panel/corporate-partners", "Corporate Partners", Handshake)}

          <div className="mt-6 mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3">Digital Product</p>
          </div>
          {navItem("/panel/ecourse-modules", "E-Course Modules", MonitorPlay)}
          {navItem("/panel/ecourse-enrollments", "E-Course Enrollments", GraduationCap)}

          <div className="mt-6 mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3">System</p>
          </div>
          {navItem("/panel/admin-users", "Admin Users", Shield)}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-sm font-bold">U</div>
              <div>
                <p className="text-sm font-bold text-white">Super Admin</p>
                <p className="text-[10px] text-slate-400">admin@theaim.id</p>
              </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-red-400 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
