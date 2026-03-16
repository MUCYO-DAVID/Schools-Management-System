'use client';

import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, List, Grid, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, addWeeks, subWeeks, startOfDay, parseISO, isWithinInterval } from 'date-fns';
import { fetchEvents, createEvent } from '../api/events';
import { useAuth } from '../providers/AuthProvider';

interface Event {
  id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  event_type?: string;
  school_name?: string;
  audience_role?: string;
}

interface EventCalendarProps {
  onEventClick?: (event: Event) => void;
  onCreateEvent?: (date: Date) => void;
  schoolId?: string;
  viewMode?: 'month' | 'week' | 'day' | 'list';
}

export default function EventCalendar({ 
  onEventClick, 
  onCreateEvent, 
  schoolId,
  viewMode: initialViewMode = 'month' 
}: EventCalendarProps) {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'list'>(initialViewMode);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    event_type: 'general',
    audience_role: 'all',
  });

  // Load events based on current view
  useEffect(() => {
    loadEvents();
  }, [currentDate, viewMode, schoolId]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      let startDate: string;
      let endDate: string;

      if (viewMode === 'month') {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        startDate = format(monthStart, 'yyyy-MM-dd');
        endDate = format(monthEnd, 'yyyy-MM-dd');
      } else if (viewMode === 'week') {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        startDate = format(weekStart, 'yyyy-MM-dd');
        endDate = format(weekEnd, 'yyyy-MM-dd');
      } else if (viewMode === 'day') {
        const dayStart = startOfDay(currentDate);
        startDate = format(dayStart, 'yyyy-MM-dd');
        endDate = format(dayStart, 'yyyy-MM-dd');
      } else {
        // List view - get all upcoming events
        startDate = format(new Date(), 'yyyy-MM-dd');
        endDate = format(addMonths(new Date(), 3), 'yyyy-MM-dd');
      }

      const filters: any = {
        start_date: startDate,
        end_date: endDate,
      };
      if (schoolId) filters.school_id = schoolId;

      const data = await fetchEvents(filters);
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else if (viewMode === 'day') {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else if (viewMode === 'day') {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (onCreateEvent) {
      onCreateEvent(date);
    } else {
      setEventForm({
        ...eventForm,
        start_date: format(date, 'yyyy-MM-dd'),
        end_date: format(date, 'yyyy-MM-dd'),
      });
      setShowEventModal(true);
    }
  };

  const handleCreateEvent = async () => {
    if (!eventForm.title || !eventForm.start_date) {
      alert('Title and start date are required');
      return;
    }

    try {
      await createEvent({
        ...eventForm,
        school_id: schoolId,
      });
      setShowEventModal(false);
      setEventForm({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        location: '',
        event_type: 'general',
        audience_role: 'all',
      });
      loadEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    }
  };

  const getEventsForDate = (date: Date): Event[] => {
    return events.filter((event) => {
      const eventStart = parseISO(event.start_date);
      const eventEnd = event.end_date ? parseISO(event.end_date) : eventStart;
      return isWithinInterval(date, { start: startOfDay(eventStart), end: eventEnd });
    });
  };

  const getEventColor = (eventType?: string) => {
    switch (eventType) {
      case 'academic':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sports':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cultural':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'meeting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Month View
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {/* Day headers */}
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-700">
              {day}
            </div>
          ))}
          {/* Calendar days */}
          {days.map((day) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <div
                key={day.toISOString()}
                className={`bg-white min-h-[100px] p-1 border-r border-b border-gray-200 ${
                  !isCurrentMonth ? 'bg-gray-50' : ''
                } ${isToday ? 'bg-blue-50' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''} cursor-pointer hover:bg-gray-50 transition-colors`}
                onClick={() => handleDateClick(day)}
              >
                <div className={`text-sm font-medium mb-1 ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'} ${isToday ? 'text-blue-600 font-bold' : ''}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onEventClick) onEventClick(event);
                      }}
                      className={`text-xs px-1 py-0.5 rounded truncate border ${getEventColor(event.event_type)} cursor-pointer hover:opacity-80`}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 px-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Week View
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {days.map((day) => {
            const dayEvents = getEventsForDate(day);
            const isToday = isSameDay(day, new Date());

            return (
              <div key={day.toISOString()} className="bg-white min-h-[400px] p-2">
                <div className={`text-center mb-2 ${isToday ? 'text-blue-600 font-bold' : 'text-gray-900'}`}>
                  <div className="text-xs text-gray-500">{format(day, 'EEE')}</div>
                  <div className="text-lg font-semibold">{format(day, 'd')}</div>
                </div>
                <div className="space-y-1">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick && onEventClick(event)}
                      className={`text-xs p-2 rounded border ${getEventColor(event.event_type)} cursor-pointer hover:opacity-80`}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      {event.start_date && (
                        <div className="text-xs opacity-75 mt-0.5">
                          {format(parseISO(event.start_date), 'HH:mm')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Day View
  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="text-lg font-semibold text-gray-900">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </div>
        </div>
        <div className="max-h-[600px] overflow-y-auto">
          {hours.map((hour) => {
            const hourEvents = dayEvents.filter((event) => {
              const eventDate = parseISO(event.start_date);
              return eventDate.getHours() === hour;
            });

            return (
              <div key={hour} className="border-b border-gray-100 p-2 min-h-[60px]">
                <div className="text-xs text-gray-500 font-medium mb-1">
                  {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
                </div>
                <div className="space-y-1">
                  {hourEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick && onEventClick(event)}
                      className={`text-sm p-2 rounded border ${getEventColor(event.event_type)} cursor-pointer hover:opacity-80`}
                    >
                      <div className="font-medium">{event.title}</div>
                      {event.location && (
                        <div className="text-xs opacity-75 mt-0.5">{event.location}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // List View
  const renderListView = () => {
    const sortedEvents = [...events].sort((a, b) => 
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="divide-y divide-gray-200">
          {sortedEvents.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No events found
            </div>
          ) : (
            sortedEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => onEventClick && onEventClick(event)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getEventColor(event.event_type)}`}>
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                    {event.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{event.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(parseISO(event.start_date), 'MMM d, yyyy HH:mm')}
                      </span>
                      {event.location && (
                        <>
                          <span>•</span>
                          <span>{event.location}</span>
                        </>
                      )}
                      {event.event_type && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{event.event_type}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleToday}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={handleNext}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 ml-2">
            {viewMode === 'month' && format(currentDate, 'MMMM yyyy')}
            {viewMode === 'week' && `Week of ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d')}`}
            {viewMode === 'day' && format(currentDate, 'MMMM d, yyyy')}
            {viewMode === 'list' && 'All Events'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                viewMode === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                viewMode === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                viewMode === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List
            </button>
          </div>

          {/* Create Event Button */}
          {(user?.role === 'admin' || user?.role === 'leader' || user?.role === 'teacher') && (
            <button
              onClick={() => {
                setEventForm({
                  ...eventForm,
                  start_date: format(new Date(), 'yyyy-MM-dd'),
                  end_date: format(new Date(), 'yyyy-MM-dd'),
                });
                setShowEventModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </button>
          )}
        </div>
      </div>

      {/* Calendar View */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading events...</p>
        </div>
      ) : (
        <>
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'list' && renderListView()}
        </>
      )}

      {/* Create Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Event</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Event title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Event description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={eventForm.start_date}
                    onChange={(e) => setEventForm({ ...eventForm, start_date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={eventForm.end_date}
                    onChange={(e) => setEventForm({ ...eventForm, end_date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Event location"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                  <select
                    value={eventForm.event_type}
                    onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="general">General</option>
                    <option value="academic">Academic</option>
                    <option value="sports">Sports</option>
                    <option value="cultural">Cultural</option>
                    <option value="meeting">Meeting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                  <select
                    value={eventForm.audience_role}
                    onChange={(e) => setEventForm({ ...eventForm, audience_role: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="student">Students</option>
                    <option value="parent">Parents</option>
                    <option value="teacher">Teachers</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setEventForm({
                    title: '',
                    description: '',
                    start_date: '',
                    end_date: '',
                    location: '',
                    event_type: 'general',
                    audience_role: 'all',
                  });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
