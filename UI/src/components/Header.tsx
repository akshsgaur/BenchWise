import { Search, Bell, ChevronDown } from 'lucide-react';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';

export function Header() {
  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Logo */}
      <div className="flex items-center">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
          <div className="w-6 h-6 bg-green-600 rounded-sm"></div>
        </div>
        <span className="font-semibold text-lg text-gray-900">BENCHWISE</span>
      </div>

      {/* Search Bar */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search"
          className="pl-10 bg-gray-50 border-gray-200 focus:border-purple-500"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Live Status */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-600 font-medium">Live</span>
        </div>

        {/* Language Selector */}
        <div className="flex items-center space-x-1 text-sm text-gray-600 cursor-pointer">
          <span>English</span>
          <ChevronDown className="w-4 h-4" />
        </div>

        {/* Notifications */}
        <Bell className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-900" />

        {/* User Profile */}
        <div className="flex items-center space-x-2 cursor-pointer">
          <Avatar className="w-8 h-8">
            <AvatarImage src="/api/placeholder/32/32" />
            <AvatarFallback className="bg-purple-100 text-purple-600">A</AvatarFallback>
          </Avatar>
          <div className="flex items-center space-x-1">
            <span className="text-sm font-medium text-gray-900">Akshit's Finances</span>
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </div>
        </div>
      </div>
    </header>
  );
}