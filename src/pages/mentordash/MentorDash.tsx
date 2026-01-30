
import React from 'react';
import DashLayout from '../../components/layout/Dash-layout';
import StatCard from '../../components/mentor-dash-com/statcard/StatCard';
import SalesChart from '../../components/mentor-dash-com/SalesChart';
import CalendarWidget from '../../components/mentor-dash-com/CalendarWidget/CalendarWidget';
import ScheduledSessions from '../../components/mentor-dash-com/ScheduledSessions/ScheduledSessions'
import { GraduationCap, BookOpen, Star, DollarSign } from 'lucide-react';
import { RecentActivityList } from '../../components/mentor-dash-com/RecentActivity';
import { ReviewsList } from '../../components/mentor-dash-com/Reviews';

const MentorDash: React.FC = () => {
    const stats = [
        { title: 'Total Student', value: '2K', icon: <GraduationCap /> },
        { title: 'Total Mentorshipst', value: '5', icon: <BookOpen /> },
        { title: 'Average Rating', value: '4.9', icon: <Star /> },
        { title: 'Total Revenue', value: '4.5K', icon: <DollarSign /> },
    ];

    return (
        <DashLayout pageTitle="Dashboard">
            <div className="bg-[#F7F7F8] min-h-screen px-4 md:px-8 py-4">
                {/* Welcome Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 capitalize">
                        Welcome back, john
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        May 21 Wednesday
                    </p>
                </div>

                {/* Content Layout */}
                <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <StatCard
                                key={index}
                                title={stat.title}
                                value={stat.value}
                                icon={stat.icon}
                            />
                        ))}
                    </div>

                    {/* Main Grid: Left (2 cols) & Right (1 col) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                        {/* LEFT COLUMN: Sales & Reviews */}
                        <div className="lg:col-span-2 space-y-6">
                            <SalesChart />
                            <ReviewsList
                                onViewAll={() => console.log('View all')}
                            />
                        </div>

                        {/* RIGHT COLUMN: Calendar, Sessions & Activity  */}
                        <div className="space-y-6">
                            <CalendarWidget />
                            <ScheduledSessions />
                            <RecentActivityList />

                        </div>

                    </div>
                </div>
            </div>
        </DashLayout>
    );
}

export default MentorDash;