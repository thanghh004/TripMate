import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { tripApi } from '../../api/tripApi';
import type { Trip } from '../../types/trip';
import { matchSearch } from '../../utils/formatters';
import Image from '../common/Image';
import { LogOut, Search, MessageSquare, Bell, Settings, MapPin, ArrowRight, Compass, Plus, Users } from 'lucide-react';

export const Header: React.FC = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const isAuthenticated = authContext?.isAuthenticated;
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleCreateTripClick = () => {
    setShowDropdown(false);
    navigate('/create-trip');
  };

  // SEARCH STATES
  const [searchInput, setSearchInput] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<Trip[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Đọc danh sách chuyến đi công khai để làm dữ liệu gợi ý cho Dropdown
  useEffect(() => {
    const loadSearchData = async () => {
      try {
        const data = await tripApi.getPublicTrips();
        setAllTrips(data);
      } catch (err) {
        console.error('Lỗi nạp dữ liệu gợi ý tìm kiếm:', err);
      }
    };
    loadSearchData();
  }, []);

  // Đọc từ khóa tìm kiếm ban đầu từ URL query parameter ?search=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get('search') || '';
    setSearchInput(searchParam);
  }, []);

  // Lắng nghe thay đổi của searchInput để tạo gợi ý
  useEffect(() => {
    if (!searchInput.trim()) {
      setSearchSuggestions([]);
      return;
    }

    const query = searchInput.trim();
    const matches = allTrips.filter(
      (trip) =>
        matchSearch(trip.title, query) ||
        matchSearch(trip.startLocation, query) ||
        matchSearch(trip.startCityName, query) ||
        matchSearch(trip.destination, query) ||
        matchSearch(trip.destinationCityName, query) ||
        matchSearch(trip.categoryName, query) ||
        matchSearch(trip.organizerName, query)
    );

    setSearchSuggestions(matches.slice(0, 6)); // Lấy tối đa 6 gợi ý mượt mà
  }, [searchInput, allTrips]);

  const executeSearch = () => {
    setIsSearchOpen(false);
    const query = searchInput.trim();
    if (query) {
      navigate(`/?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeSearch();
    }
  };

  const handleSelectTripSuggestion = (tripId: string) => {
    setIsSearchOpen(false);
    navigate(`/trips/${tripId}`);
  };

  // Click outside listener cho cả User Profile Dropdown & Search Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Satisfy&display=swap');
        .font-logo { font-family: 'Satisfy', cursive; }
      `}</style>

      {/* Header / Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-slate-50 px-6 py-4 transition-all">
        <div className="w-full flex items-center justify-between px-2 sm:px-4">
          {/* Logo & Left Navigation Elements */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0 font-logo text-3xl text-slate-800 transition-colors select-none">
              TripMate
            </Link>

            {/* Dribbble / Facebook Style Search Bar */}
            <div className="hidden md:flex items-center gap-6 relative" ref={searchContainerRef}>
              <div className="flex items-center bg-slate-200/80 rounded-full pl-4 pr-1.5 py-1.5 border border-transparent focus-within:border-slate-300/40 focus-within:bg-slate-50 transition-all w-[320px] lg:w-[380px]">
                <input
                  type="text"
                  value={searchInput}
                  onFocus={() => setIsSearchOpen(true)}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Tìm kiếm địa điểm bạn muốn đến..."
                  className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 w-full font-medium"
                />
                <button
                  type="button"
                  onClick={executeSearch}
                  title="Tìm kiếm"
                  className="w-9 h-9 rounded-full bg-[#ea4c89] hover:bg-[#df3f7c] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <Search size={16} />
                </button>
              </div>

              {/* DROPDOWN KẾT QUẢ GỢI Ý CHUẨN FACEBOOK */}
              {isSearchOpen && searchInput.trim().length > 0 && (
                <div className="absolute top-14 left-0 w-full bg-slate-50 rounded-2xl border border-slate-200/90 py-2 z-50 overflow-hidden text-left space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Dòng 1: Tìm kiếm tất cả theo từ khóa */}
                  <div
                    onClick={executeSearch}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-200/60 cursor-pointer transition text-xs font-semibold text-slate-800 border-b border-slate-200/70"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-200/80 text-slate-600 flex items-center justify-center shrink-0">
                      <Search size={15} />
                    </div>
                    <div className="flex-1 truncate">
                      <span>Tìm kiếm từ khóa "</span>
                      <span className="font-bold text-coral-600">{searchInput.trim()}</span>
                      <span>"</span>
                    </div>
                    <ArrowRight size={14} className="text-slate-400 shrink-0" />
                  </div>

                  {/* Danh sách các chuyến đi gợi ý */}
                  {searchSuggestions.length > 0 ? (
                    searchSuggestions.map((trip) => (
                      <div
                        key={trip.id}
                        onClick={() => handleSelectTripSuggestion(trip.id)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-slate-200/60 cursor-pointer transition"
                      >
                        {trip.coverImageUrl ? (
                          <Image
                            src={trip.coverImageUrl}
                            alt={trip.title}
                            containerClassName="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-coral-50 text-coral-600 flex items-center justify-center shrink-0 font-bold text-xs">
                            <MapPin size={16} />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {trip.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1">
                            <MapPin size={11} className="text-teal-600 shrink-0" />
                            <span>
                              {trip.startCityName || trip.startLocation} ➔ {trip.destinationCityName || trip.destination}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-center text-xs text-slate-400">
                      Không tìm thấy chuyến đi gợi ý phù hợp
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Menu Links */}
            <nav className="hidden lg:flex items-center gap-7">
              <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-0.5 cursor-pointer">
                Trang chủ
              </Link>
              <a className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-0.5 cursor-pointer">
                Khám phá
              </a>
              <a className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-0.5 cursor-pointer">
                Tuyển dụng
              </a>
              <a className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-0.5 cursor-pointer">
                Tìm việc làm
              </a>
              <a className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-0.5 cursor-pointer">
                Cộng đồng
              </a>
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-full transition-colors cursor-pointer"
                >
                  <MessageSquare size={19} />
                </button>
                <button
                  type="button"
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-full transition-colors cursor-pointer relative"
                >
                  <Bell size={19} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ea4c89]" />
                </button>

                {/* Avatar User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 cursor-pointer focus:outline-none"
                  >
                    {user?.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt={user.fullName || 'User'}
                        containerClassName="w-9 h-9 rounded-full border border-slate-200"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-coral-100 text-coral-600 font-bold text-sm flex items-center justify-center">
                        {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu (Dribbble Style) */}
                  {showDropdown && (
                    <>
                      {/* Invisible Backdrop to close dropdown on click outside */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowDropdown(false)}
                      />

                      <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2.5 z-50 flex flex-col select-none animate-in fade-in duration-150">
                        {/* Actions & Links */}
                        <div className="w-full space-y-1 text-left">
                          {/* 1. Tạo chuyến đi mới */}
                          <button
                            onClick={handleCreateTripClick}
                            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                          >
                            <Plus size={15} className="text-coral-500" />
                            <span>Tạo chuyến đi mới</span>
                          </button>

                          {/* 2. Chuyến đi đã tạo */}
                          <button
                            onClick={() => {
                              setShowDropdown(false);
                              navigate('/my-trips');
                            }}
                            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                          >
                            <Compass size={15} />
                            <span>Chuyến đi đã tạo</span>
                          </button>

                          {/* 3. Chuyến đi đã tham gia */}
                          <button
                            onClick={() => {
                              setShowDropdown(false);
                              navigate('/my-trips?tab=joined');
                            }}
                            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                          >
                            <Users size={15} />
                            <span>Chuyến đi đã tham gia</span>
                          </button>

                          {/* 4. Cài đặt */}
                          <button
                            onClick={() => {
                              setShowDropdown(false);
                              navigate('/profile');
                            }}
                            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                          >
                            <Settings size={15} />
                            <span>Cài đặt</span>
                          </button>
                        </div>

                        <hr className="w-full border-slate-100 my-2" />

                        {/* 5. Đăng xuất */}
                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            authContext?.logout();
                            navigate('/');
                          }}
                          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                        >
                          <LogOut size={15} />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5 h-10">
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer select-none"
                >
                  Đăng ký
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-900/80 rounded-full transition-all shadow-xs cursor-pointer select-none"
                >
                  Đăng nhập
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
