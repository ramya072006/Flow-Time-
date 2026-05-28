import { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core';
import { motion } from 'framer-motion';
import { Plus, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { getEventColor } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';

interface CalendarEvent {
  _id: string;
  title: string;
  start: string;
  end: string;
  type: string;
  color?: string;
  allDay?: boolean;
}

interface CreateEventModal {
  open: boolean;
  start?: string;
  end?: string;
}

export function CalendarPage() {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [createModal, setCreateModal] = useState<CreateEventModal>({ open: false });
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const { toast } = useToast();

  const fetchEvents = async (start: Date, end: Date) => {
    setIsLoading(true);
    try {
      const response = await api.get('/calendar/events', {
        params: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
      });
      setEvents(response.data.data);
    } catch {
      toast({ title: 'Failed to load events', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setCreateModal({
      open: true,
      start: selectInfo.startStr,
      end: selectInfo.endStr,
    });
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = events.find((e) => e._id === clickInfo.event.id);
    if (event) setSelectedEvent(event);
  };

  const handleEventDrop = async (dropInfo: EventDropArg) => {
    try {
      await api.patch(`/calendar/events/${dropInfo.event.id}`, {
        start: dropInfo.event.startStr,
        end: dropInfo.event.endStr,
      });
      toast({ title: 'Event rescheduled', variant: 'default' });
    } catch {
      dropInfo.revert();
      toast({ title: 'Failed to reschedule event', variant: 'destructive' });
    }
  };

  const calendarEvents = events.map((event) => ({
    id: event._id,
    title: event.title,
    start: event.start,
    end: event.end,
    allDay: event.allDay,
    backgroundColor: event.color || getEventColor(event.type),
    borderColor: event.color || getEventColor(event.type),
    extendedProps: { type: event.type },
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 h-full"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {['task', 'meeting', 'focus', 'habit', 'break', 'personal'].map((type) => (
              <div key={type} className="flex items-center gap-1">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: getEventColor(type) }}
                />
                <span className="text-xs text-muted-foreground capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const calApi = calendarRef.current?.getApi();
              if (calApi) {
                const view = calApi.view;
                fetchEvents(view.activeStart, view.activeEnd);
              }
            }}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setCreateModal({ open: true })}>
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <Card className="p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
          }}
          events={calendarEvents}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          editable={true}
          droppable={true}
          height="calc(100vh - 280px)"
          datesSet={(dateInfo) => {
            fetchEvents(dateInfo.start, dateInfo.end);
          }}
          eventContent={(eventInfo) => (
            <div className="px-1 py-0.5 overflow-hidden">
              <p className="text-xs font-medium truncate">{eventInfo.event.title}</p>
            </div>
          )}
        />
      </Card>

      {/* Create Event Modal */}
      {createModal.open && (
        <CreateEventModal
          start={createModal.start}
          end={createModal.end}
          onClose={() => setCreateModal({ open: false })}
          onCreated={(event) => {
            setEvents((prev) => [...prev, event]);
            setCreateModal({ open: false });
          }}
        />
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDeleted={(id) => {
            setEvents((prev) => prev.filter((e) => e._id !== id));
            setSelectedEvent(null);
          }}
        />
      )}
    </motion.div>
  );
}

function CreateEventModal({
  start, end, onClose, onCreated
}: {
  start?: string;
  end?: string;
  onClose: () => void;
  onCreated: (event: CalendarEvent) => void;
}) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('personal');
  const [startTime, setStartTime] = useState(start?.slice(0, 16) || '');
  const [endTime, setEndTime] = useState(end?.slice(0, 16) || '');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startTime || !endTime) return;
    setIsLoading(true);
    try {
      const response = await api.post('/calendar/events', {
        title,
        type,
        start: new Date(startTime).toISOString(),
        end: new Date(endTime).toISOString(),
      });
      onCreated(response.data.data);
      toast({ title: 'Event created', variant: 'default' });
    } catch {
      toast({ title: 'Failed to create event', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-card rounded-xl border border-border shadow-2xl w-full max-w-md p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Create Event</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Event title"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {['task', 'meeting', 'focus', 'habit', 'break', 'personal', 'blocked'].map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Start</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">End</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function EventDetailModal({
  event, onClose, onDeleted
}: {
  event: CalendarEvent;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await api.delete(`/calendar/events/${event._id}`);
      onDeleted(event._id);
      toast({ title: 'Event deleted' });
    } catch {
      toast({ title: 'Failed to delete event', variant: 'destructive' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-card rounded-xl border border-border shadow-2xl w-full max-w-sm p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">{event.title}</h3>
            <Badge className="mt-1" style={{ backgroundColor: getEventColor(event.type) }}>
              {event.type}
            </Badge>
          </div>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Start: {new Date(event.start).toLocaleString()}</p>
          <p>End: {new Date(event.end).toLocaleString()}</p>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">Close</Button>
          <Button variant="destructive" onClick={handleDelete} className="flex-1">Delete</Button>
        </div>
      </motion.div>
    </div>
  );
}
