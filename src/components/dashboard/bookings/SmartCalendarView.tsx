"use client";

import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import "react-big-calendar/lib/css/react-big-calendar.css";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Appointment } from './BookingListView';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: Appointment;
    status: Appointment['status'];
}

interface SmartCalendarViewProps {
    appointments: Appointment[];
    onSelectEvent: (appointment: Appointment) => void;
}

export function SmartCalendarView({ appointments, onSelectEvent }: SmartCalendarViewProps) {
    const [view, setView] = useState<View>(Views.WEEK);
    const [date, setDate] = useState(new Date());

    // Transform appointments to calendar events
    const events: CalendarEvent[] = appointments.map(apt => {
        const startDate = apt.date.toDate();
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hr default

        return {
            id: apt.id,
            title: `${apt.customerName} - ${apt.serviceName}`,
            start: startDate,
            end: endDate,
            resource: apt,
            status: apt.status
        };
    });

    // Custom Event Component
    const EventComponent = ({ event }: { event: CalendarEvent }) => {
        const getStatusColor = (status: string) => {
            switch (status) {
                case 'confirmed': return 'bg-green-500';
                case 'pending': return 'bg-yellow-500';
                case 'completed': return 'bg-[#6F2DBD]';
                default: return 'bg-gray-400';
            }
        };

        const getBgColor = (status: string) => {
            switch (status) {
                case 'confirmed': return 'bg-green-100 text-green-800';
                case 'pending': return 'bg-yellow-100 text-yellow-800';
                case 'completed': return 'bg-[#f3e8ff] text-[#6F2DBD]';
                default: return 'bg-gray-100 text-gray-600';
            }
        };

        return (
            <div className={cn(
                "h-full w-full rounded-md px-2 py-1 text-xs font-semibold border-l-[3px] shadow-sm overflow-hidden leading-tight flex flex-col",
                getBgColor(event.status),
                status === 'confirmed' ? "border-green-500" :
                    status === 'pending' ? "border-yellow-500" :
                        status === 'completed' ? "border-[#6F2DBD]" : "border-gray-400"
            )}
                style={{ borderColor: '' }} // Let tailwind handle border color class logic above if possible, or use inline style for dynamic
            >
                {/* Tailwind border-l classes work, but dynamic color class construction is cleaner */}
                <div className={cn("absolute left-0 top-0 bottom-0 w-[4px]", getStatusColor(event.status))} />

                <div className="pl-1.5">
                    <span className="block truncate">{event.title}</span>
                    <span className="block font-normal opacity-80">{format(event.start, 'h:mm a')}</span>
                </div>
            </div>
        );
    };

    // Custom Toolbar
    const CustomToolbar = (toolbar: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const goToBack = () => toolbar.onNavigate('PREV');
        const goToNext = () => toolbar.onNavigate('NEXT');
        const goToToday = () => toolbar.onNavigate('TODAY');

        return (
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-900 font-serif">
                        {format(toolbar.date, 'MMMM yyyy')}
                    </h2>
                    <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100">
                        <button onClick={goToBack} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-500">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={goToToday} className="px-3 py-1 text-sm font-bold text-gray-600 hover:text-gray-900">
                            Today
                        </button>
                        <button onClick={goToNext} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-500">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                    {['month', 'week', 'day'].map(v => (
                        <button
                            key={v}
                            onClick={() => toolbar.onView(v)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize",
                                toolbar.view === v
                                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                            )}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    // Current Time Indicator Logic
    // We render a custom component for the "TimeGutter" or use a background event? 
    // Easier approach: CSS hacks or a custom "TimeSlotWrapper".
    // react-big-calendar doesn't have a native "Current Time Line" easily exposed without custom TimeGrid.
    // However, we can use a custom `components.timeSlotWrapper`? No, that wraps every slot.
    // Standard hack: CSS pointer-events-none absolute div. But positioning is hard.
    // Actually, RBC supports `getNow` prop, but doesn't draw a line.

    // Let's rely on `dayPropGetter` to maybe highlight today column?
    // And for the line, we might add a custom marker if possible. 
    // For now, simpler Google Style: Clean grid.

    return (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 h-[800px] overflow-hidden">
            <style jsx global>{`
                .rbc-calendar { font-family: inherit; }
                .rbc-header { padding: 12px 0; font-weight: 700; color: #6b7280; border-bottom: 1px solid #f3f4f6; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; background: transparent; }
                .rbc-time-view, .rbc-month-view { border: none; }
                .rbc-day-bg { border-left: 1px solid #f3f4f6; }
                .rbc-timeslot-group { border-bottom: 1px solid #f3f4f6; min-height: 60px; } /* taller slots */
                .rbc-time-content { border-top: none; } /* remove top border */
                .rbc-time-header.rbc-overflowing { border-right: none; }
                .rbc-time-header-content { border-left: 1px solid #f3f4f6; }
                .rbc-time-gutter .rbc-timeslot-group { border-right: none; }
                .rbc-label { color: #9ca3af; font-size: 0.75rem; font-weight: 600; }
                .rbc-current-time-indicator { background-color: #ef4444; height: 2px; } /* If RBC adds this class in future versions, it's ready. */
                
                /* Hide today bg color default */
                .rbc-today { background-color: transparent; }
                /* Highlight today header */
                .rbc-header.rbc-today { color: #6F2DBD; }
                
                /* Event styling overrides */
                .rbc-event { background: transparent; padding: 0; border: none; outline: none; box-shadow: none; }
                .rbc-event:focus { outline: none; }
            `}</style>

            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                defaultView={Views.WEEK}
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                onSelectEvent={(event) => onSelectEvent(event.resource)}
                components={{
                    toolbar: CustomToolbar,
                    event: EventComponent
                }}
                min={new Date(0, 0, 0, 8, 0, 0)} // 8 AM
                max={new Date(0, 0, 0, 22, 0, 0)} // 10 PM
                step={30}
                timeslots={2}
                className="font-sans"
            />
        </div>
    );
}
